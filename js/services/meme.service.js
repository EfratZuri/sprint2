'use strict';
// localStorage.clear();
let gKeywordsKeys = ['Men', 'Happy', 'Animal', 'Cute', 'Funny', 'Baby', 'Bad'];
const gFonts = ['Impact', 'Ariel'];
const DIFF_KEYWORD_SIZE = '14px';
const gLineHight = '16px';
const INCREASE_KEYWORD_SIZE = 4;
const IMGS_COUNT = 18;
let gSortBy = 'all';
let gIdCount = 1;
let gImgs;
let gCurImg;
let gKeywords = {};
let gMeme = {};

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
// Gallery

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

// Go to the NEXT line

function toNextLine() {
	gMeme.selectedLineIdx++;
	if (gMeme.selectedLineIdx >= gMeme.lines.length) gMeme.selectedLineIdx = 0;

	return gMeme.lines[gMeme.selectedLineIdx];
}

// Add line

function addLine(vals, height, width, isEmoji = false) {
	// Placing the sec line at the bottom
	if (gMeme.lines.length === 1)
		gMeme.lines.push(
			_createLine({ x: 10, y: height - 10 - 24 - 5 }, isEmoji ? vals : '')
		);
	else
		gMeme.lines.push(
			_createLine({ x: 10, y: getRandomInt(0, height) }, isEmoji ? vals : '')
		);

	!isEmoji && updateValues(vals);
	// Updating the Selected line
	gMeme.selectedLineIdx++;
}

// MOVE text

function moveText(num, max, min) {
	gMeme.lines[gMeme.selectedLineIdx].pos.y += num;
	const currPos = gMeme.lines[gMeme.selectedLineIdx].pos.y;
	if (currPos > max || currPos < min)
		gMeme.lines[gMeme.selectedLineIdx].pos.y =
			currPos < min ? max - 10 : min + 10;
}

// Align text

function alignText(alignment, width) {
	gMeme.lines[gMeme.selectedLineIdx].textAlign = alignment;
	gMeme.lines[gMeme.selectedLineIdx].pos.x =
		alignment === 'left' ? 10 : alignment === 'right' ? width - 10 : width / 2;
}

// Update the values in the meme

function updateValues(vals) {
	gMeme.lines[gMeme.selectedLineIdx].txt = vals.txt;
	gMeme.lines[gMeme.selectedLineIdx].fill = vals.fill;
	gMeme.lines[gMeme.selectedLineIdx].stroke = vals.stroke;
}

function changeFontStyle(style, val) {
	gMeme.lines[gMeme.selectedLineIdx][style] = val;
}

//Update font size

function updateFontSize(num) {
	gMeme.lines[gMeme.selectedLineIdx].size += num;
}

// DELETE line

function deleteLine() {
	if (gMeme.lines.length === 1) gMeme.lines[gMeme.selectedLineIdx].txt = '';
	else gMeme.lines.splice(gMeme.selectedLineIdx--, 1);

	return gMeme.lines[gMeme.selectedLineIdx];
}

// Add key word

function addKeyWords(img, keywords) {
	img.keywords.push(...keywords);
}

// ///////////CREATE//////////////

// Create IMAGES

function _createImgs() {
	let imgs = loadFromStorage('imgs');
	if (!imgs || !imgs.length) {
		imgs = [];
		for (let i = 0; i < IMGS_COUNT; i++) {
			imgs.push(_createImg(`${gIdCount}.jpg`));
		}
		addKeyWords(imgs[0], ['funny', 'men']);
		addKeyWords(imgs[1], ['Happy', 'animal', 'cute']);
		addKeyWords(imgs[2], ['funny', 'animal', 'cute']);
		addKeyWords(imgs[3], ['animal']);
		addKeyWords(imgs[4], ['funny', 'baby', 'cute']);
		addKeyWords(imgs[5], ['funny', 'men']);
		addKeyWords(imgs[6], ['funny', 'baby']);
		addKeyWords(imgs[7], ['funny']);
		addKeyWords(imgs[8], ['funny', 'baby', 'cute']);
		addKeyWords(imgs[9], ['funny']);
		addKeyWords(imgs[10], ['bad']);
		addKeyWords(imgs[11], ['men']);
		addKeyWords(imgs[12], ['men']);
		addKeyWords(imgs[13], ['men']);
		addKeyWords(imgs[14], ['men']);
		addKeyWords(imgs[15], ['men']);
		addKeyWords(imgs[16], ['men']);
		addKeyWords(imgs[17], ['funny']);
	}
	gImgs = imgs;
	_saveImgsToStorage();
}

// Create IMAGE

function _createImg(url, keywords = ['happy']) {
	return { id: gIdCount++, url, keywords };
}

// Create image meme

function createImgMeme(imgId) {
	gCurImg = getImgById(imgId);
	gMeme = _createMeme(imgId);
	return gCurImg;
}

// Create MEME

function _createMeme(id, selectedLineIdx = 0) {
	return {
		selectedImgId: id,
		selectedLineIdx,
		lines: [_createLine({ x: 10, y: 10 })],
	};
}

// Create LINE

function _createLine(
	pos = {},
	txt = '',
	size = 24,
	fontFam = 'Impact',
	textAlign = 'left',
	fontStyle = 'Normal',
	stroke = '#fff',
	fill = '#111'
) {
	return { txt, size, fontFam, stroke, fontStyle, textAlign, fill, pos };
}

// Create KEYWORD

function _createKeyword(frequency = 1, fontSize = DIFF_KEYWORD_SIZE) {
	return { frequency, fontSize };
}

// ///////////////GET////////////////////

// Get the images array

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

// Get current image

function getCurImg() {
	return gCurImg;
}

// Get LINE

function getLine() {
	return gMeme.lines[gMeme.selectedLineIdx];
}

// Get meme object

function getMeme() {
	return gMeme;
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

////////////////////////////////////////////////////////////////////////////////////
// Auxiliary functions

function isMemeNotActive() {
	const lines = gMeme.lines;
	return (
		gMeme === {} || (lines.length === 1 && !lines[gMeme.selectedLineIdx].txt)
	);
}

// FIND image by id

function getImgById(imgId) {
	return gImgs.find(({ id }) => id === +imgId);
	// return gImgs.find((img) => img.id === +id);
}
