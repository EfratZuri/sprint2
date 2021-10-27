'use strict';

// localStorage.clear();

const gFonts = ['Impact'];

const IMGS_COUNT = 18;
let gSortBy = 'all';
let gIdCount = 1;

let gKeyWords = {};
let gImgs;
_createImgs();

const gLineHight = '16px';

let gMeme = {};

// Gallery

function updateSortBy(sortBy) {
	gSortBy = sortBy.toLowerCase();
}

function createImgMeme(imgId) {
	let img = getImgById(imgId);

	gMeme = _createMeme(imgId);
	return img;
}

// Add image

function getImgById(id) {
	return gImgs.find((img) => img.id === +id);
}

// Add line

function addLine() {
	let pos;
	if (gMeme.selectedLineIdx === 1) {
		pos = {};
	}
	gMeme.lines.push(_createLine());
	// Updating the Selected line
	gMeme.selectedLineIdx++;
}

// update the values in the meme

function updateValues(fill, stroke, txt) {
	gMeme.lines[gMeme.selectedLineIdx].txt = txt;
	gMeme.lines[gMeme.selectedLineIdx].fill = fill;
	gMeme.lines[gMeme.selectedLineIdx].stroke = stroke;
}

//

function updateFontSize(num) {
	gMeme.lines[gMeme.selectedLineIdx].size += num;
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
	return { selectedImgId: id, selectedLineIdx, lines: [_createLine()] };
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

function getMemeFont() {
	console.log(gMeme);
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
