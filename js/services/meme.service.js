'use strict';

// localStorage.clear();

const gFonts = ['Impact', 'Ariel'];

const IMGS_COUNT = 18;
let gSortBy = 'all';
let gIdCount = 1;

let gKeywords = {};

let gImgs;
let gCurImg;
const gLineHight = '16px';

let gMeme = {};

window.addEventListener('load', function () {
	_createImgs();

	let keywords = loadFromStorage('keywords');
	// console.log(Object.entries(keywords));
	if (!keywords || keywords === {}) {
		keywords = {
			Funny: { frequency: 1, fontSize: '14px' },
			Happy: { frequency: 1, fontSize: '14px' },
			Animal: { frequency: 1, fontSize: '14px' },
			Cute: { frequency: 1, fontSize: '14px' },
		};

		addKeyWords(gImgs[0], ['Funny']);
		addKeyWords(gImgs[1], ['Happy', 'Animal', 'Cute']);
		addKeyWords(gImgs[2], ['Funny', 'Cute']);
		addKeyWords(gImgs[3], ['Animal']);
		addKeyWords(gImgs[4], ['Funny']);
		addKeyWords(gImgs[5], ['Funny']);
		addKeyWords(gImgs[6], ['Funny']);
		addKeyWords(gImgs[7], ['Funny']);
		addKeyWords(gImgs[8], ['Funny']);
		addKeyWords(gImgs[9], ['Funny']);
		addKeyWords(gImgs[10], ['Funny']);
		addKeyWords(gImgs[11], ['Funny']);
		addKeyWords(gImgs[12], ['Funny']);
		addKeyWords(gImgs[13], ['Funny']);
		addKeyWords(gImgs[14], ['Funny']);
		addKeyWords(gImgs[15], ['Funny']);
		addKeyWords(gImgs[16], ['Funny']);
		addKeyWords(gImgs[17], ['Funny']);
	}

	gKeywords = keywords;
	_saveKeywordsToStorage();
	_saveImgsToStorage();
});
// Gallery

function sortBy(sortBy, fontSize) {
	gSortBy = sortBy;
	gKeywords[gSortBy].frequency++;
	gKeywords[gSortBy].fontSize = fontSize;
	_saveKeywordsToStorage();
}

// Create image meme

function createImgMeme(imgId) {
	gCurImg = getImgById(imgId);
	gMeme = _createMeme(imgId);
	return gCurImg;
}

// Get image by Id

// console.log(getImgById(3));
function getImgById(imgId) {
	return gImgs.find(({ id }) => id === +imgId);
	// return gImgs.find((img) => img.id === +id);
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
	console.log(alignment);
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

function _createImg(url, keywords = ['Happy']) {
	// if (!gKeywords[keywords]) gKeywords[keywords] = 1;

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
	size = 24,
	fontFam = 'Impact',
	textAlign = 'left',
	fontStyle = 'Normal',
	stroke = '#fff',
	fill = '#111'
) {
	return { txt, size, fontFam, stroke, fontStyle, textAlign, fill, pos };
}

// ///////////////GET////////////////////

// Get the images array

function getImgs() {
	if (gSortBy === 'all') return gImgs;
	return gImgs.filter((img) =>
		img.keywords.find((keyword) => keyword === gSortBy)
	);
}

// Get current image

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
	return gKeywords;
	// return Object.keys(gKeywords);
}

// local storage

// save to local storage

function _saveImgsToStorage() {
	saveToStorage('imgs', gImgs);
}

// Save Keyword to local storage

function _saveKeywordsToStorage() {
	saveToStorage('keywords', gKeywords);
}

// ///////////////

// function isLineClicked(clickedPos = '') {
// 	const { pos } = [...gMeme.lines.map(({ pos }) => pos)];
// 	const distance = Math.sqrt(
// 		(pos.x - clickedPos.x) ** 2 + (pos.y - clickedPos.y) ** 2
// 	);
// 	// return distance <= gCircle.size;
// }

function moveTxt(dx, dy) {
	gMeme.lines[gMeme.selectedLineIdx].pos.x += dx;
	gMeme.lines[gMeme.selectedLineIdx].pos.y += dy;
}
