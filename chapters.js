// chapters.js – loads story data and drives the chapter flow
import { renderDialogue } from './dialogue.js';
import { renderChoices } from './choices.js';
import { saveGameState, replayChapter } from './save.js';
import { resolveEnding } from './endings.js';

let storyData = null;

/** Load story JSON (synchronously via fetch) and build lookup maps */
async function loadStory() {
  const response = await fetch('assets/data/story.json');
  const raw = await response.json();
  // flatten chapters array into a map for fast lookup
  const chapterMap = {};
  const sceneMap = {};
  raw.chapters.forEach(ch => {
    chapterMap[ch.id] = ch;
    // also flatten scenes within each chapter
    if (ch.scenes) {
      ch.scenes.forEach(sc => {
        sc._chapterId = ch.id;
        sceneMap[sc.id] = sc;
      });
    }
  });
  storyData = { chapters: raw.chapters, chapterMap, sceneMap };
}

/** Start a chapter by id */
async function startChapter(chapterId) {
  if (!storyData) await loadStory();
  const chapter = storyData.chapterMap[chapterId];
  if (!chapter) {
    console.error('Chapter not found:', chapterId);
    return;
  }

  if (!window.gameState) {
    window.gameState = {
      currentChapterId: null,
      currentSceneId: null,
      visitedChapters: [],
      stats: {},
      relationships: {},
      memory: {},
      flags: {}
    };
  }

  // Update game state
  window.gameState.currentChapterId = chapterId;
  if (!window.gameState.visitedChapters.includes(chapterId)) {
    window.gameState.visitedChapters.push(chapterId);
  }
  
  // Begin first scene of this chapter or resume current scene
  let activeSceneId = window.gameState.currentSceneId;
  const hasScene = chapter.scenes && chapter.scenes.some(sc => sc.id === activeSceneId);
  if (!hasScene || !activeSceneId) {
    activeSceneId = chapter.sceneOrder ? chapter.sceneOrder[0] : (chapter.scenes && chapter.scenes[0] && chapter.scenes[0].id);
  }
  if (!activeSceneId) {
    console.error('No scenes defined for chapter', chapterId);
    return;
  }
  loadScene(activeSceneId);
}

/** Load a scene and render its dialogue and choices */
function loadScene(sceneId) {
  const scene = storyData.sceneMap[sceneId];
  if (!scene) {
    console.error('Scene not found:', sceneId);
    return;
  }
  window.gameState.currentSceneId = sceneId;

  const container = document.getElementById('main');

  // Walk through dialogue rendering
  const nextLine = () => {
    renderDialogue({
      speaker: scene.speaker || 'Narrator',
      text: scene.text || '',
      container,
      onComplete: () => {
        // 1️⃣ Intercept the climax ending screen
        if (sceneId === 'ending') {
          resolveEnding();
        } else if (scene.choices && scene.choices.length) {
          // Render the choice buttons below the text card
          renderChoices(scene.choices, container, choiceHandler, scene.speaker);
        } else if (scene.nextScene) {
          // Render a simple "Continue" choice so users control when the text advances
          renderChoices([{ text: "Continue", nextScene: scene.nextScene }], container, choiceHandler, scene.speaker);
        }
      }
    });
  };

  const choiceHandler = nextId => {
    const container = document.getElementById('main');

    // smooth fade out transition
    container.style.opacity = '0';
    container.style.transform = 'translateY(12px)';

    setTimeout(() => {
      // clear previous scene completely
      container.innerHTML = '';

      // load next scene
      if (nextId) {
        loadScene(nextId);
      }

      // fade in new scene
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';

      saveGameState();
    }, 350);
  };

  nextLine();
}

// Listen for replay events from save.js or Flowchart
window.addEventListener('chapter-replay', e => {
  const { chapterId } = e.detail;
  startChapter(chapterId);
});

export { startChapter, loadScene, storyData };
export { loadStory }; // Export for visual flowchart mapping

/**
 * Render the Route Flowchart tab in the Journal modal
 */
export function renderFlowchartTab() {
  const container = document.getElementById('flowchart-container');
  if (!container) return;
  container.innerHTML = '';

  const visited = window.gameState?.visitedChapters || [];
  
  // Define chapters and check points in visual tree
  const nodes = [
    { type: 'chapter', id: 'chapter1', name: 'Chapter 1: The Matchmaker' },
    { type: 'choice', check: () => {
        if (window.gameState?.flags?.['accepted_edwin_stroll']) return 'Accepted Edwin\'s Garden Stroll';
        if (window.gameState?.flags?.['declined_edwin']) return 'Declined Edwin\'s Stroll';
        return null;
      }
    },
    { type: 'chapter', id: 'chapter2', name: 'Chapter 2: A Gentleman Arrives' },
    { type: 'choice', check: () => {
        if (window.gameState?.flags?.['flirted_with_lucien']) return 'Flirted with Lucien (Frank)';
        if (window.gameState?.flags?.['ignored_lucien']) return 'Ignored Lucien';
        if (window.gameState?.flags?.['distrusted_lucien']) return 'Distrusted Lucien\'s Motives';
        return null;
      }
    },
    { type: 'chapter', id: 'chapter3', name: 'Chapter 3: Tea, Rumors & Pride' },
    { type: 'chapter', id: 'chapter4', name: 'Chapter 4: The Garden Gathering' },
    { type: 'choice', check: () => {
        if (window.gameState?.flags?.['danced_theodore']) return 'Danced with Theodore (Knightley)';
        if (window.gameState?.flags?.['danced_lucien']) return 'Danced with Lucien (Frank)';
        if (window.gameState?.flags?.['aloof_at_gathering']) return 'Stayed Aloof';
        return null;
      }
    },
    { type: 'chapter', id: 'chapter5', name: 'Chapter 5: Broken Hearts' },
    { type: 'chapter', id: 'chapter6', name: 'Chapter 6: The Ballroom Night' },
    { type: 'chapter', id: 'chapter7', name: 'Chapter 7: Secrets Revealed' },
    { type: 'choice', check: () => {
        if (window.gameState?.flags?.['forgave_lucien']) return 'Forgave Lucien\'s Secret';
        if (window.gameState?.flags?.['disappointed_lucien']) return 'Disappointed in Lucien';
        if (window.gameState?.flags?.['kept_secret']) return 'Kept Lucien\'s Secret';
        return null;
      }
    },
    { type: 'chapter', id: 'chapter8', name: 'Chapter 8: A Heart Learns' },
    { type: 'chapter', id: 'chapter9', name: 'Chapter 9: Society Watches' },
    { type: 'chapter', id: 'chapter10', name: 'Chapter 10: The Choice of the Heart' }
  ];

  // Render nodes sequentially with connector lines
  nodes.forEach((n, idx) => {
    if (n.type === 'chapter') {
      const isVisited = visited.includes(n.id);
      
      const nodeEl = document.createElement('div');
      nodeEl.className = `flowchart-node ${isVisited ? 'visited' : 'locked'}`;
      nodeEl.textContent = isVisited ? n.name : '🔒 Locked Chapter';
      
      if (isVisited) {
        nodeEl.addEventListener('click', () => {
          if (confirm(`Would you like to replay starting from "${n.name}"? This will clear choices and progress made after this point.`)) {
            replayChapter(n.id);
            // Hide modal
            document.getElementById('journal-modal').classList.add('hidden');
          }
        });
      }
      container.appendChild(nodeEl);
      
      // Append connector if not the last node
      if (idx < nodes.length - 1) {
        const nextNode = nodes[idx+1];
        const isNextVisited = nextNode.type === 'chapter' ? visited.includes(nextNode.id) : (nextNode.check() !== null);
        
        const conn = document.createElement('div');
        conn.className = `flowchart-connector ${isVisited && isNextVisited ? 'visited' : ''}`;
        container.appendChild(conn);
      }
    } else if (n.type === 'choice') {
      const choiceName = n.check();
      if (choiceName) {
        const nodeEl = document.createElement('div');
        nodeEl.className = 'flowchart-node visited';
        nodeEl.style.fontSize = '0.75rem';
        nodeEl.style.background = 'rgba(216, 178, 110, 0.1)';
        nodeEl.style.borderColor = 'var(--color-rose)';
        nodeEl.style.color = 'var(--text-secondary)';
        nodeEl.textContent = `Choice: ${choiceName}`;
        
        container.appendChild(nodeEl);
        
        // Append connector
        if (idx < nodes.length - 1) {
          const nextNode = nodes[idx+1];
          const isNextVisited = nextNode.type === 'chapter' ? visited.includes(nextNode.id) : (nextNode.check() !== null);
          
          const conn = document.createElement('div');
          conn.className = `flowchart-connector ${isNextVisited ? 'visited' : ''}`;
          container.appendChild(conn);
        }
      }
    }
  });

  // At the bottom, render the Endings split branch
  const isC10Visited = visited.includes('chapter10');
  if (isC10Visited) {
    const branchHeader = document.createElement('div');
    branchHeader.style.fontSize = '0.8rem';
    branchHeader.style.fontWeight = 'bold';
    branchHeader.style.color = 'var(--color-rose)';
    branchHeader.style.marginTop = '0.5rem';
    branchHeader.textContent = 'Branching Endings';
    container.appendChild(branchHeader);

    const endingsContainer = document.createElement('div');
    endingsContainer.className = 'flowchart-branches visited';
    endingsContainer.style.display = 'flex';
    endingsContainer.style.flexWrap = 'wrap';
    endingsContainer.style.justifyContent = 'center';
    endingsContainer.style.gap = '0.8rem';
    endingsContainer.style.marginTop = '0.5rem';
    
    const endingsList = [
      { id: 'true_love', name: 'True Love' },
      { id: 'charming_mistake', name: 'Charming Mistake' },
      { id: 'independent_woman', name: 'Independent' },
      { id: 'queen_of_society', name: 'Queen of Society' },
      { id: 'lonely_pride', name: 'Lonely Pride' },
      { id: 'matchmaker', name: 'Matchmaker' },
      { id: 'scandal', name: 'Scandal' },
      { id: 'rival_queens', name: 'Rival Queens' }
    ];
    
    endingsList.forEach(e => {
      const isReached = window.gameState?.ending === e.id;
      const endEl = document.createElement('div');
      endEl.className = `flowchart-node ending-node ${isReached ? 'visited' : 'locked'}`;
      endEl.style.minWidth = '130px';
      endEl.textContent = isReached ? `🏆 Ending: ${e.name}` : '🔒 Locked Ending';
      endingsContainer.appendChild(endEl);
    });
    container.appendChild(endingsContainer);
  }
}
