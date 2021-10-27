// Selectors

let gElImageItems;
let gElCanvas;
let gCtx;
let gTxtInput;

// LOAD

window.addEventListener('load', function () {
	gElCanvas = document.querySelector('#canvas');
	gCtx = gElCanvas.getContext('2d');
	gTxtInput = document.querySelector('input[name="txt"]');

	// Rendering the images
	renderGallery();

	// Show gallery

	document
		.querySelector('.gallery-btn')
		.addEventListener('click', toggleGallery);

	document.querySelector('.memes-btn').addEventListener('click', toggleGallery);

	const elSortBtnsCont = document.querySelector('.sort-btns-container');

	elSortBtnsCont.addEventListener('click', onSortImgs);

	// Selects all image items
	const elImgsContainer = document.querySelector('.images-container');
	// Click on  image
	elImgsContainer.addEventListener('click', onCreateImgMeme);

	// renderImgCanvas(createImgMeme(1));

	// Updating the values from the inputs

	const elInputs = document.querySelectorAll('.control-box input');

	elInputs.forEach((input) => input.addEventListener('input', onUpdateValues));

	// Edit btns

	const elEditBtns = document.querySelectorAll('.control-box .btn');

	elEditBtns.forEach((btn) => btn.addEventListener('click', onEditClick));
});

// FUNCTIONS

// On create image meme

function onCreateImgMeme(e) {
	const elTarget = e.target;

	// Check if the user click on an image.
	if (!elTarget.src) return;

	toggleGallery();

	renderImgCanvas(createImgMeme(elTarget.getAttribute('data-img-id')));
}

////////////////////////////////
// Control editor!

// Update values

// Edit the meme

function onUpdateValues(e) {
	const elInputs = document.querySelectorAll('.control-box input');
	const inputsVals = getInputsValues(elInputs);
	updateValues(inputsVals);

	renderCanvas();
}

function onEditClick(e) {
	const val = e.target.closest('.btn').name;
	if (val === 'decrease' || val === 'increase') {
		updateFontSize(val === 'increase' ? -1 : 1);
	} else if (val === 'delete') {
		inputTxt();
		deleteLine();
	} else if (val === 'add') {
		if (!gTxtInput.value) return;
		const elInputs = document.querySelectorAll('.control-box input');
		const inputsVals = getInputsValues(elInputs);
		inputTxt();
		addLine(inputsVals);
	} else if (val === 'swap') {
		inputTxt(toNextLine().txt);
	}
	renderCanvas();
}

// render image canvas

function renderImgCanvas(curImg) {
	const img = new Image();
	img.src = `meme-imgs/${curImg.url}`;
	img.onload = () => {
		gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height);
		renderTexts();
	};
}

function resizeCanvas() {
	const elContainer = document.querySelector('.canvas-container');
	gElCanvas.width = elContainer.offsetWidth;
	gElCanvas.height = elContainer.offsetHeight;
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
	meme.lines.forEach((line) => drawText(line));
}

// draw text

function drawText(line) {
	gCtx.beginPath();
	console.log(line);
	gCtx.fillStyle = line.fill;

	gCtx.strokeStyle = line.stroke;

	gCtx.font = `${line.size}px ${line.fontFam}`;

	gCtx.fillText(line.txt, line.pos.x, line.pos.y + line.size);
	gCtx.strokeText(line.txt, line.pos.x, line.pos.y + line.size);
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

// Clear

function inputTxt(txt = '') {
	document.querySelector('input[name="txt"]').value = txt;
}

// GALLERY

function onSortImgs(e) {
	if (!e.target.value) return;

	updateSortBy(e.target.value);
	renderImgs();
}

////////////////////// RENDER///////////////////////

// render gallery

function renderGallery() {
	renderSearchFilterContainer();
	renderImgs();
}

// Render Search and filter container

function renderSearchFilterContainer() {
	const elSortBtnsCont = document.querySelector('.sort-btns-container');
	const elSearchKeyword = document.querySelector('#image-keywords');

	const keywords = getKeywords();
	keywords.forEach((keyword) => {
		const keywordCapitalized = capitalizeStr(keyword);
		const strHtml = `<button class="btn sort-btn" value="${keywordCapitalized}">${keywordCapitalized}</button>`;
		elSortBtnsCont.insertAdjacentHTML('afterbegin', strHtml);
		elSearchKeyword.insertAdjacentHTML(
			'afterbegin',
			`<option value="${keywordCapitalized}"></option>`
		);
	});
}

// render IMAGES

function renderImgs() {
	const elImgsContainer = document.querySelector('.images-container');
	elImgsContainer.innerHTML = '';
	const imgs = getImgs();
	imgs.forEach((img) => renderImg(img));
}
// render Image
function renderImg(img) {
	const elImgsContainer = document.querySelector('.images-container');
	const strHtml = `		
    <div class="img-item">
        <img src="meme-imgs/${img.url}" alt="" data-img-id="${img.id}">
    </div>`;

	elImgsContainer.insertAdjacentHTML('beforeend', strHtml);
}

// function calcNextLinePos() {
// 	let pos;
// 	const [width, hight] = [gElCanvas.width, gElCanvas.height];
// 	const lines = getMeme().lines;
// 	if (lines.length === 1) {
// 		pos = {};
// 	}
// }
function getEvPos(ev) {
	var pos = {
		x: ev.offsetX,
		y: ev.offsetY,
	};
	if (gTouchEvs.includes(ev.type)) {
		ev.preventDefault();
		ev = ev.changedTouches[0];
		pos = {
			x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
			y: ev.pageY - ev.target.offsetTop - ev.target.clientTop,
		};
	}
	return pos;
}
