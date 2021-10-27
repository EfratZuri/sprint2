'use strict';

// Selectors

let gElImageItems;
let gElCanvas;
let gCtx;

// Event listeners

// LOAD

window.addEventListener('load', function () {
	gElCanvas = document.querySelector('#canvas');
	gCtx = gElCanvas.getContext('2d');

	// Rendering the images
	// renderGallery();

	// const elSortBtnsCont = document.querySelector('.sort-btns-container');

	// elSortBtnsCont.addEventListener('click', onSortImgs);

	// // Selects all image items
	// const elImgsContainer = document.querySelector('.images-container');
	// // Click on  image
	// elImgsContainer.addEventListener('click', onCreateImgMeme);

	renderImgCanvas(createImgMeme(1));

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
	// clearCanvas();
	const elInputs = document.querySelectorAll('.control-box input');
	console.log(getInputsValues(elInputs));

	const fillVal = document.querySelector('input[name="fill"]').value;
	const strokeVal = document.querySelector('input[name="stroke"]').value;
	const txtVal = document.querySelector('input[name="text"]').value;

	updateValues(fillVal, strokeVal, txtVal);

	gCtx.fillStyle = fillVal;
	gCtx.strokeStyle = strokeVal;
	gCtx.font = getMemeFont();
	// bold 16px Arial";
	// const { x, y } = calcHight();
	const fontS = gMeme.lines[gMeme.selectedLineIdx].size;

	gCtx.fillText(txtVal, 10, 10 + fontS);
}

function onEditClick(e) {
	const val = e.target.value;
	if (val === 'decrease' || val === 'increase') {
		updateFontSize(val === 'increase' ? -1 : 1);
	}
}
// function onAddLine() {
// addLine()
// }

// add image

function onAddImg() {}

// Sort images

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

// render image canvas

function renderImgCanvas(curImg) {
	const img = new Image();
	img.src = `meme-imgs/${curImg.url}`;
	img.onload = () => {
		gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height); //img,x,y,xend,yend
	};
}

// Clear canvas

function clearCanvas() {
	gCtx.clearRect(0, 0, gElCanvas.width, gElCanvas.height);
}

// Toggle Gallery

function toggleGallery() {
	document
		.querySelector('.gallery-section-container')
		.classList.toggle('hidden');
	document.querySelector('.meme-editor-section').classList.toggle('hidden');
}

// Calc hight

// function calcHight() {
// 	const [width, hight] = [gElCanvas.width, gElCanvas.height];
// 	const fontS = gMeme.lines[gMeme.selectedLineIdx].size;
// 	return 10
// }

function resizeCanvas() {
	const elContainer = document.querySelector('.canvas-container');
	gElCanvas.width = elContainer.offsetWidth;
	gElCanvas.height = elContainer.offsetHeight;
}

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
