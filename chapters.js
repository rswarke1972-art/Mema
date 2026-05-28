// chapters.js – loads story data and drives the chapter flow
import { renderDialogue } from './dialogue.js';
import { renderChoices } from './choices.js';
import { updateStats, updateRelationship, addMemoryFlag } from './progress.js';
import { saveGameState } from './save.js';

let storyData = null;

/** Load story JSON (synchronously via fetch) */
// Load story JSON (synchronously via fetch) and build lookup maps
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
        // store a reference to its parent chapter id for navigation if needed
        sc._chapterId = ch.id;
        sceneMap[sc.id] = sc;
      });
    }
  });
  // assign to storyData
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
    memories: []
  };
}
  // Update game state
  window.gameState.currentChapterId = chapterId;
  if (!window.gameState.visitedChapters.includes(chapterId)) {
    window.gameState.visitedChapters.push(chapterId);
  }
  // Begin first scene of this chapter
  const firstSceneId = chapter.sceneOrder ? chapter.sceneOrder[0] : (chapter.scenes && chapter.scenes[0] && chapter.scenes[0].id);
  if (!firstSceneId) {
    console.error('No scenes defined for chapter', chapterId);
    return;
  }
  loadScene(firstSceneId);
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
  container.innerHTML = '';

  // Walk through dialogue array sequentially
  // Single-scene dialogue rendering
const nextLine = () => {
  renderDialogue({
    speaker: scene.speaker || 'Narrator',
    text: scene.text || '',
    container,
    onComplete: () => {
      if (scene.choices && scene.choices.length) {
        renderChoices(scene.choices, container, choiceHandler);
      } else if (scene.nextScene) {
        loadScene(scene.nextScene);
      }
    }
  });
};

  const choiceHandler = nextId => {
  const container = document.getElementById('main');

  // smooth fade out
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

// Listen for replay events from save.js
window.addEventListener('chapter-replay', e => {
  const { chapterId } = e.detail;
  startChapter(chapterId);
});

export { startChapter, loadScene };
