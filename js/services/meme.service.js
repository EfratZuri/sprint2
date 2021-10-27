'use strict';

// localStorage.clear();

const gFonts = ['Impact'];

const IMGS_COUNT = 18;
let gSortBy = 'all';
let gIdCount = 1;

let gKeyWords = {};

let gImgs;
_createImgs();
let gCurImg;
const gLineHight = '16px';

let gMeme = {};

// Gallery

function updateSortBy(sortBy) {
	gSortBy = sortBy.toLowerCase();
}

function createImgMeme(imgId) {
	gCurImg = getImgById(imgId);

	gMeme = _createMeme(imgId);
	return gCurImg;
}

// Add image

function getImgById(id) {
	return gImgs.find((img) => img.id === +id);
}

// Go to the next line

function toNextLine() {
	gMeme.selectedLineIdx++;
	if (gMeme.selectedLineIdx >= gMeme.lines.length) gMeme.selectedLineIdx = 0;

	return gMeme.lines[gMeme.selectedLineIdx];
}

// Add line

function addLine(vals) {
	let pos = gMeme.lines[gMeme.selectedLineIdx].pos;

	// if (gMeme.selectedLineIdx === 1) {}
	gMeme.lines.push(_createLine({ x: pos.x + 10, y: pos.y + 10 }));

	updateValues(vals);
	// Updating the Selected line
	gMeme.selectedLineIdx++;
}

// update the values in the meme

function updateValues(vals) {
	gMeme.lines[gMeme.selectedLineIdx].txt = vals.txt;
	gMeme.lines[gMeme.selectedLineIdx].fill = vals.fill;
	gMeme.lines[gMeme.selectedLineIdx].stroke = vals.stroke;
	// gMeme.lines[gMeme.selectedLineIdx].size = vals.size;
	// gMeme.lines[gMeme.selectedLineIdx].fontFam = vals.fontFam;
}
//

function updateFontSize(num) {
	gMeme.lines[gMeme.selectedLineIdx].size += num;
}
function deleteLine() {
	gMeme.lines.splice(gMeme.selectedLineIdx--, 1);
}

// ****CREATE**

// create images

function _createImgs() {
	let imgs = loadFromStorage('imgs');
	if (!imgs || !imgs.length) {
		imgs = [];
		for (let i = 0; i < IMGS_COUNT; i++)
			imgs.push(_createImg(`${gIdCount}.jpg`));
	}
	gImgs = imgs;
	_saveImgsToStorage();
}

// create image

function _createImg(url, keywords = 'happy') {
	if (!gKeyWords[keywords]) gKeyWords[keywords] = 1;

	return { id: gIdCount++, url, keywords };
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
	size = 60,
	fontFam = 'Impact',
	stroke = '#fff',
	fill = '#111'
) {
	return { txt, size, fontFam, stroke, fill, pos };
}

// get

// Get the images array

function getImgs() {
	if (gSortBy === 'all') return gImgs;
	return gImgs.filter((img) =>
		img.keywords.find((keyword) => keyword === gSortBy)
	);
}

function getCurImg() {
	return gCurImg;
}

// Get LINE

function getLine() {
	return gMeme.lines[gMeme.selectedLineIdx];
}

// get meme object

function getMeme() {
	return gMeme;
}

function getMemeFont() {
	const { fontFam, size } = gMeme.lines[gMeme.selectedLineIdx];
	return `bold ${size}px ${fontFam}`;
}
// Get the Keyword array

function getKeywords() {
	return Object.keys(gKeyWords);
}

// local storage

// save to local storage

function _saveImgsToStorage() {
	saveToStorage('imgs', gImgs);
}
