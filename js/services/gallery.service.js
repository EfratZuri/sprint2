'use strict';

const DIFF_KEYWORD_SIZE = '14px';
let gKeywordsKeys = [
	'Dog',
	'Cat',
	'Man',
	'Happy',
	'Animal',
	'Cute',
	'Funny',
	'Baby',
	'Woman',
	'Bad',
	'Carton',
	'Angry',
];
let gSortBy = 'all';
let gIdCount = 1;
let gImgs;
let gKeywords = {};

// ON LOAD

window.addEventListener('load', function () {
	_createImgs();

	let keywords = loadFromStorage('keywords');
	if (!keywords || keywords === {}) {
		keywords = gKeywordsKeys.reduce((acc, cur) => {
			acc[cur.toLocaleLowerCase()] = _createKeyword();
			return acc;
		}, {});
	}

	gKeywords = keywords;
	_saveKeywordsToStorage();
	_saveImgsToStorage();
});

// SORT by

function sortBy(sortBy, fontSize) {
	const prevSort = gSortBy;
	gSortBy = sortBy;
	if (sortBy === 'all') return;

	if (prevSort !== gSortBy) {
		gKeywords[gSortBy].frequency++;
		gKeywords[gSortBy].fontSize = fontSize + INCREASE_KEYWORD_SIZE + 'px';
		_saveKeywordsToStorage();
	}

	return gKeywords[gSortBy].fontSize;
}

//////////////////////////////////////CREATE//////////////////
// Create IMAGES

function _createImgs() {
	let imgs = loadFromStorage('imgs');
	if (!imgs || !imgs.length) {
		imgs = [];

		for (let i = 0; i < 25; i++) {
			imgs.push(_createImg(`./imgs/meme-imgs/${gIdCount}.jpg`));
			// imgs.push(_createImg(`${gIdCount}.jpg`));
		}
		addKeyWords(imgs[0], ['woman']);
		addKeyWords(imgs[1], ['happy', 'funny', 'cute', 'baby']);
		addKeyWords(imgs[2], ['funny', 'man']);
		addKeyWords(imgs[3], ['animal', 'dog', 'cute']);
		addKeyWords(imgs[4], ['funny', 'angry', 'baby']);
		addKeyWords(imgs[5], ['funny', 'animal', 'dog']);
		addKeyWords(imgs[6], ['man', 'funny']);
		addKeyWords(imgs[7], ['man']);
		addKeyWords(imgs[8], ['funny', 'baby']);
		addKeyWords(imgs[9], ['funny', 'man']);
		addKeyWords(imgs[10], ['man', 'funny']);
		addKeyWords(imgs[11], ['man']);
		addKeyWords(imgs[12], ['man', 'bad']);
		addKeyWords(imgs[13], ['angry', 'man']);
		addKeyWords(imgs[14], ['baby', 'happy', 'cute']);
		addKeyWords(imgs[15], ['baby', 'animal', 'dog', 'cute']);
		addKeyWords(imgs[16], ['man']);
		addKeyWords(imgs[17], ['man']);
		addKeyWords(imgs[18], ['funny', 'man']);
		addKeyWords(imgs[19], ['funny', 'woman']);
		addKeyWords(imgs[20], ['man']);
		addKeyWords(imgs[21], ['funny', 'man']);
		addKeyWords(imgs[22], ['man']);
		addKeyWords(imgs[23], ['carton']);
		addKeyWords(imgs[24], ['animal', 'cat']);
	}
	gImgs = imgs;
	_saveImgsToStorage();
}

// Create IMAGE

function _createImg(url, keywords = []) {
	return { id: gIdCount++, url, keywords };
}

// Create KEYWORD

function _createKeyword(frequency = 1, fontSize = DIFF_KEYWORD_SIZE) {
	return { frequency, fontSize };
}

//////////////////////////////////////GET//////////////////

// Get the IMAGES array

function getImgs() {
	if (gSortBy === 'all') return gImgs;
	return gImgs.filter((img) =>
		img.keywords.find((keyword) => keyword === gSortBy)
	);
}

// Get current sort by

function getCurSort() {
	return gSortBy;
}

// Get the Keyword array

function getKeywords() {
	return gKeywords;
}

// //////////////local storage/////////////////////////

// Save IMAGES to local storage

function _saveImgsToStorage() {
	saveToStorage('imgs', gImgs);
}

// Save KEYWORDS to local storage

function _saveKeywordsToStorage() {
	saveToStorage('keywords', gKeywords);
}

//////////Auxiliary functions/////

// FIND image by ID

function getImgById(imgId) {
	return gImgs.find(({ id }) => id === +imgId);
}
// Add key word

function addKeyWords(img, keywords) {
	img.keywords.push(...keywords);
}
