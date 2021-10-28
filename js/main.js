'use strict';
let gElCanvas;
let gCtx;
let gOldText;
let gTxtInput;
let gElEditInputs;

let gElImgsContainer;
const SELECTED_LINE_COLOR = '#111';
const gEditBtnsFunctions = {
	add: onAddLine,
	delete: onDeleteLine,
	swap: onNextLine,
	moveLine: onMoveLine,
	textAlign: onAlignTxt,
	changeFontSize: onUpdateFontSize,
};

// LOAD

window.addEventListener('load', function () {
	// Selectors
	gElCanvas = document.querySelector('#canvas');
	gCtx = gElCanvas.getContext('2d');
	gTxtInput = document.querySelector('input[name="txt"]');
	gElEditInputs = document.querySelectorAll('.control-box input');
	gElImgsContainer = document.querySelector('.images-container');

	renderStart();

	// Event listeners

	(function () {
		generalEventListeners();
		canvasEventListeners();
		galleryEventListeners();
	})();
});

// EVENT LISTENERS

// GENERAL event listeners

function generalEventListeners() {
	// Open MENU in mobile

	document
		.querySelectorAll('.btn-menu')
		.forEach((ev) => ev.addEventListener('click', toggleMenu));

	// On main nav click

	document.querySelectorAll('.memes-btn, .gallery-btn').forEach((btn) =>
		btn.addEventListener('click', (e) => {
			toggleMenu(e);
			toggleGallery(e);
		})
	);
}

// CANVAS event listeners

function canvasEventListeners() {
	document
		.getElementById('select-font-fam')
		.addEventListener('change', onChangeFontFam);
	document
		.getElementById('select-font-style')
		.addEventListener('change', onChangeFontStyle);

	// Updating the values from the inputs

	gElEditInputs.forEach((input) =>
		input.addEventListener('input', onUpdateValues)
	);

	// EDIT text btns
	const elEditBtns = document.querySelectorAll('.control-box .btn');

	elEditBtns.forEach((btn) => {
		btn.addEventListener('mousedown', onEditClick);
		btn.addEventListener('touchstart', onEditClick);
	});
}

// GALLERY event listeners

function galleryEventListeners() {
	// Search bar
	const imgs = getImgs();

	const elSearchBar = document.getElementById('keyword-choice');
	elSearchBar.addEventListener('keyup', (e) => {
		const searchStr = e.target.value;
		const filteredImgs = imgs.filter((img) => {
			return img.keywords.join(' ').includes(searchStr);
		});
		renderImgs(filteredImgs);
	});

	// Sort buttons

	const elSortBtnsCont = document.querySelectorAll(
		'.sort-btns-container, .show-all-btn'
	);

	elSortBtnsCont.forEach((btn) => btn.addEventListener('click', onSortImgs));

	// Click on  image
	gElImgsContainer.addEventListener('click', onCreateImgMeme);
}

/////////////////////////////////////////////////////////

// FUNCTIONS

function onUpdateValues(e) {
	const inputsVals = getInputsValues(gElEditInputs);
	let meme = getMeme();

	gOldText = `${meme.lines[meme.selectedLineIdx].txt}`;

	updateValues(inputsVals);
	renderCanvas();
}

// Clicking on one of the buttons related to EDITING the text on the canvas

function onEditClick(e) {
	// Checks if there is an active line.
	if (isMemeNotActive()) return;

	const elEditBtn = e.target.closest('.btn');

	const [name, val] = [elEditBtn.name, elEditBtn.value];

	if (elEditBtn.classList.contains('emoji-btn'))
		addLine(val, gElCanvas.height, gElCanvas.width, true);
	else gEditBtnsFunctions[name](val);

	renderCanvas();
}

// On Change font SIZE

function onUpdateFontSize(val) {
	updateFontSize(val === 'increase' ? 1 : -1);
}

// On Align text

function onAlignTxt(val) {
	alignText(val, gElCanvas.width);
}

// On ADD line

function onAddLine(val) {
	if (!gTxtInput.value) return;
	const inputsVals = getInputsValues(gElEditInputs);
	inputTxt();
	addLine(inputsVals, gElCanvas.height, gElCanvas.width);
}

// Change font family

function onChangeFontFam(e) {
	changeFontStyle('fontFam', e.target.value);
	renderCanvas();
}

// Change FONT STYLE

function onChangeFontStyle(e) {
	changeFontStyle('fontStyle', e.target.value);
	renderCanvas();
}

// DELETE line

function onDeleteLine() {
	const line = deleteLine();
	renderInputs(line);
}

//  MOVE to the next line

function onNextLine() {
	const line = toNextLine();
	renderInputs(line);
}

// MOVE the text UP

function onMoveLine(val) {
	moveText(val === 'up' ? -5 : 5, gElCanvas.height, 0);
}
/////
//Download the meme
function downloadImg(elLink) {
	renderCanvas(true);
	var imgContent = gElCanvas.toDataURL('image/jpeg');
	elLink.href = imgContent;
}

//////////////////////////////// CANVAS RENDER////////////////////////////

// Render image canvas

function renderImgCanvas(curImg) {
	const img = new Image();
	img.src = `meme-imgs/${curImg.url}`;
	img.onload = () => {
		gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height);
		renderTexts();
	};
}

// render canvas

function renderCanvas() {
	gCtx.save();
	renderImgCanvas(getCurImg());
	gCtx.restore();
}

// render text

function renderTexts() {
	let meme = getMeme();
	meme.lines.forEach((line, i) => drawText(line, i, meme.selectedLineIdx));
}

// DRAW text

function drawText(line, curIdx, selectedLineIdx) {
	gCtx.beginPath();
	// Check
	let metrics = gCtx.measureText(line.txt);
	let w = metrics.width;
	if (w > gElCanvas.width) {
		gTxtInput.classList.add('error');
		line.txt = gOldText;
	} else gTxtInput.classList.remove('error');

	let { x, y } = line.pos;

	gCtx.fillStyle = line.fill;
	gCtx.strokeStyle = line.stroke;
	gCtx.font = `${line.fontStyle} ${line.size}px ${line.fontFam}`;
	gCtx.textAlign = line.textAlign;

	gCtx.fillText(line.txt, x, y + line.size);
	gCtx.strokeText(line.txt, x, y + line.size);
}

//////////////////////////////////////// GALLERY ////////////////////////////////////////

//  On SORT images

function onSortImgs(e) {
	const val = e.target.value;

	if (!val || getCurSort() === val.toLowerCase()) return;

	const curFontSize = Number.parseFloat(
		getComputedStyle(e.target).fontSize,
		10
	);

	const newFontSize = sortBy(e.target.value.toLowerCase(), curFontSize);

	//Increasing the font
	if (val !== 'all') e.target.style.fontSize = newFontSize;

	renderImgs(getImgs());
}

// On an image in a  gallery clicked

function onCreateImgMeme(e) {
	const elTarget = e.target;
	// Check if the user click on an image.
	if (!elTarget.src) return;
	// Showing the meme section
	toggleGallery();
	// Clearing the txt input
	gTxtInput.value = '';
	renderImgCanvas(createImgMeme(elTarget.getAttribute('data-img-id')));
}

////////////////////// RENDER///////////////////////

// Render gallery

function renderGallery() {
	renderSearchFilterContainer();
	renderImgs(getImgs());
}

// Render Search and filter container

function renderSearchFilterContainer() {
	const elSortBtnsCont = document.querySelector('.sort-btns-container');
	const elSearchKeyword = document.querySelector('#image-keywords');

	const keywords = getKeywords();
	Object.entries(keywords).forEach(([keyword, { _, fontSize }]) => {
		const keywordCapitalized = capitalizeStr(keyword);
		const strHtml = `<button class="btn sort-btn" style="font-size:${fontSize}"  value="${keywordCapitalized}">${keywordCapitalized}</button>`;
		elSortBtnsCont.insertAdjacentHTML('afterbegin', strHtml);
		elSearchKeyword.insertAdjacentHTML(
			'afterbegin',
			`<option value="${keywordCapitalized}"></option>`
		);
	});
}

// render IMAGES

function renderImgs(imgs) {
	gElImgsContainer.innerHTML = '';
	imgs.forEach((img) => renderImg(img));
}

// render Image
function renderImg(img) {
	const strHtml = `		
    <div class="img-item">
        <img src="meme-imgs/${img.url}" alt="" data-img-id="${img.id}">
    </div>`;

	gElImgsContainer.insertAdjacentHTML('afterbegin', strHtml);
}

function renderStart() {
	// Current year update on reserved rights.

	document.querySelector(
		'.main-footer .year'
	).innerText = `${new Date().getFullYear()}`;

	// Rendering the images
	renderGallery();

	renderImgCanvas(createImgMeme(1));
}

// TOGGLE

// Toggle MENU

function toggleMenu(e) {
	document.body.classList.toggle('menu-open');
}

// Toggle Gallery

function toggleGallery(e) {
	if (e && e.target.classList.contains('active')) return;
	document
		.querySelectorAll('.main-nav .link')
		.forEach((link) => link.classList.remove('active'));
	if (e) e.target.classList.add('active');
	else document.querySelector('.memes-btn').classList.add('active');
	document
		.querySelector('.gallery-section-container')
		.classList.toggle('hidden');
	document.querySelector('.meme-editor-section').classList.toggle('hidden');
}

////////////////
// Clear

function inputTxt(txt = '') {
	document.querySelector('input[name="txt"]').value = txt;
}

function renderInputs(line) {
	document.querySelectorAll('.control-box input').forEach((input) => {
		input.value = line[input.name];
	});
}
