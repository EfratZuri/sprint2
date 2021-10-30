'use strict';
// localStorage.clear();
const gFonts = ['Impact', 'Ariel'];
const gAlignments = {
	left: () => 10,
	right: (width) => width - 10,
	center: (width) => width / 2,
};
const DIFF_FONT_SIZE = 24;
const INCREASE_KEYWORD_SIZE = 4;
let gSavedMemes;
let gCurImg;
let gLineDrag;
let gMeme = {};

window.addEventListener('load', function () {
	gSavedMemes = loadFromStorage('savedMemes') || [];
});

// DELETE meme

function removeSavedMeme(idx) {
	gSavedMemes.splice(idx, 1);
	_saveMemeImagesToStorage();
}

// SAVE canvas

function saveCanvas(dataURI) {
	gSavedMemes.push({ src: dataURI, meme: gMeme, curImg: gCurImg });
	_saveMemeImagesToStorage();
}

// Go to the NEXT line

function toNextLine() {
	gMeme.selectedLineIdx++;
	if (gMeme.selectedLineIdx >= gMeme.lines.length) gMeme.selectedLineIdx = 0;

	return gMeme.lines[gMeme.selectedLineIdx];
}

// Add line

function addLine(vals, height, isEmoji = false) {
	// Placing the sec line at the bottom
	let { x = 10, y } =
		gMeme.lines.length === 1
			? { y: height - 10 - 24 - 5 }
			: { y: getRandomInt(0, height) };

	// Adding a new line
	gMeme.lines.push(_createLine({ x, y }, isEmoji ? vals : '', isEmoji));
	!isEmoji && updateValues(vals);
	// Updating the Selected line
	gMeme.selectedLineIdx++;
}

// DELETE line

function deleteLine() {
	if (gMeme.lines.length === 1) gMeme.lines[gMeme.selectedLineIdx].txt = '';
	else gMeme.lines.splice(gMeme.selectedLineIdx--, 1);

	return gMeme.lines[gMeme.selectedLineIdx];
}

// MOVE text

function moveText(num, max, min) {
	const curLine = getSelectedLine();
	curLine.pos.y += num;
	const currPos = curLine.pos.y;
	if (currPos > max || currPos < min)
		curLine.pos.y = currPos < min ? max - 10 : min + 10;
}

// Align text

function alignText(alignment, width) {
	const curLine = getSelectedLine();
	curLine.textAlign = alignment;
	curLine.pos.x = gAlignments[alignment](width);
}

function updateValues(vals) {
	const curLine = getSelectedLine();
	if (!curLine.isEmoji) curLine.txt = vals.txt;
	curLine.fill = vals.fill;
	curLine.stroke = vals.stroke;
	curLine.size = +vals.fontSizeRange;
}

function changeFontStyle(style, val) {
	gMeme.lines[gMeme.selectedLineIdx][style] = val;
}

//Update font size

function updateFontSize(num) {
	gMeme.lines[gMeme.selectedLineIdx].size += num;
}

/////////////CREATE//////////////

// Create image meme

function createImgMeme(imgId) {
	[gCurImg, gMeme] = [getImgById(imgId), createMeme(imgId)];
}

// Create MEME

function createMeme(id, selectedLineIdx = 0) {
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
	isEmoji = false,
	size = DIFF_FONT_SIZE,
	isDrag = false,
	fontFam = 'Impact',
	textAlign = 'left',
	fontStyle = 'Normal',
	stroke = '#fff',
	fill = '#111'
) {
	return {
		txt,
		isDrag,
		isEmoji,
		size,
		fontFam,
		stroke,
		fontStyle,
		textAlign,
		fill,
		pos,
	};
}

/////////////////SET////////////////////

// Set line DRAG

function setLineDrag(line, isDrag) {
	if (isDrag) gLineDrag = line;
	gLineDrag.isDrag = isDrag;
}

// Set current MEME

function setCurMeme(meme) {
	gMeme = meme;
}

// Set current IMAGE

function setCurImg(img) {
	gCurImg = img;
}

// ///////////////GET////////////////////

// Get current image

function getCurImg() {
	return gCurImg;
}

// Get Selected LINE

function getSelectedLine() {
	return gMeme.lines[gMeme.selectedLineIdx];
}

// Get lines

function getLines() {
	return gMeme.lines;
}

// Get meme object

function getMeme() {
	return gMeme;
}

// Get SAVED memes

function getSavedMemes() {
	return gSavedMemes;
}

// Get line drag

function getLineDrag() {
	return gLineDrag;
}

////////////////////////////////////////////////////////////////////////////////////
// Auxiliary functions

function isMemeNotActive() {
	const lines = gMeme.lines;
	return (
		gMeme === {} || (lines.length === 1 && !lines[gMeme.selectedLineIdx].txt)
	);
}

/////////////////////////////////////////////

function moveLine(dx, dy) {
	gLineDrag.pos.x += dx;
	gLineDrag.pos.y += dy;
}

//

function lineClicked(lineWidth, evPos) {
	return gMeme.lines.find(({ txt, pos, size }, i) => {
		const isClicked = isLineClicked(evPos, pos, lineWidth(txt), size);
		if (isClicked) gMeme.selectedLineIdx = i;
		return isClicked;
	});
}

//

function isLineClicked(evPos, linePos, width, height) {
	return (
		evPos.y <= height + linePos.y &&
		evPos.y >= linePos.y &&
		evPos.x <= width + linePos.x &&
		evPos.x >= linePos.x
	);
}

////////////////local storage/////////////////////////
function _saveMemeImagesToStorage() {
	saveToStorage('savedMemes', gSavedMemes);
}
