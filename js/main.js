// Selectors

let gElCanvas;
let gCtx;
let gOldText;
let gTxtInput;
const SELECTED_LINE_COLOR = '#111';
let gElEditInputs;

// LOAD

window.addEventListener('load', function () {
	gElCanvas = document.querySelector('#canvas');
	gCtx = gElCanvas.getContext('2d');
	gTxtInput = document.querySelector('input[name="txt"]');
	// Search bar
	// const keywords = Object.keys(getKeywords());

	const imgs = getImgs();

	const elSearchBar = document.getElementById('keyword-choice');
	elSearchBar.addEventListener('keyup', (e) => {
		const searchStr = e.target.value;
		const filteredImgs = imgs.filter((img) => {
			return img.keywords.join(' ').includes(searchStr);
		});
		renderImgs(filteredImgs);
	});

	// Current year update on reserved rights.

	document.querySelector(
		'.main-footer .year'
	).innerText = `${new Date().getFullYear()}`;

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

	renderImgCanvas(createImgMeme(4));

	// Updating the values from the inputs

	gElEditInputs = document.querySelectorAll('.control-box input');

	gElEditInputs.forEach((input) =>
		input.addEventListener('input', onUpdateValues)
	);

	// Edit btns

	eventListeners();

	const elEditBtns = document.querySelectorAll('.control-box .btn');

	elEditBtns.forEach((btn) => btn.addEventListener('click', onEditClick));

	// addListeners();
});

function eventListeners() {
	generalEventListeners();
	canvasEventListeners();
	galleryEventListeners();
}

function generalEventListeners() {}
function canvasEventListeners() {
	document
		.getElementById('select-font-fam')
		.addEventListener('change', onChangeFontFam);
	document
		.getElementById('select-font-style')
		.addEventListener('change', onChangeFontStyle);
}

function galleryEventListeners() {}
/////////////////////////////////////////////////////////

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

// On Change in one of the inputs

function onUpdateValues(e) {
	const inputsVals = getInputsValues(gElEditInputs);
	let meme = getMeme();
	gOldText = `${meme.lines[meme.selectedLineIdx].txt}`;
	updateValues(inputsVals);
	renderCanvas();
}

// Change font family

function onChangeFontFam(e) {
	changeFontStyle('fontFam', e.target.value);
	renderCanvas();
}

function onChangeFontStyle(e) {
	changeFontStyle('fontStyle', e.target.value);
	renderCanvas();
}
// Clicking on one of the buttons related to EDITING the text on the canvas

function onEditClick(e) {
	// Checks if there is an active line.
	const meme = getMeme();
	const lines = meme.lines;
	if (meme === {} || (lines.length === 1 && !lines[meme.selectedLineIdx].txt))
		return;

	// value
	const elEditBtn = e.target.closest('.btn');
	const [name, val] = [elEditBtn.name, elEditBtn.value];
	if (elEditBtn.classList.contains('emoji-btn'))
		addLine(val, gElCanvas.height, gElCanvas.width, true);
	else if (name === 'decrease' || name === 'increase')
		updateFontSize(name === 'increase' ? 1 : -1);
	else if (name === 'delete') onDeleteLine();
	else if (name === 'add') {
		if (!gTxtInput.value) return;
		const inputsVals = getInputsValues(gElEditInputs);
		inputTxt();
		addLine(inputsVals, gElCanvas.height, gElCanvas.width);
	} else if (name === 'swap') onNextLine();
	else if (name === 'up' || name === 'down') onMoveText(name === 'up' ? -5 : 5);
	else if (name === 'textAlign') alignText(val, gElCanvas.width);

	//

	renderCanvas();
}

/////////////////////

// DELETE line

function onDeleteLine() {
	const line = deleteLine();
	renderInputs(line);
}

//  MOVE to the next line

function onNextLine() {
	const line = toNextLine();
	renderInputs(line);
	// inputTxt(line.txt);
}

// MOVE the text UP

function onMoveText(num) {
	moveText(num, gElCanvas.height, 0);
}

// Render image canvas

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

//

function renderInputs(line) {
	document.querySelectorAll('.control-box input').forEach((input) => {
		input.value = line[input.name];
	});
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

// draw text

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

	// Show the selected line

	// if (curIdx === selectedLineIdx) {
	// 	gCtx.strokeStyle = SELECTED_LINE_COLOR;
	// 	gCtx.beginPath();
	// 	gCtx.rect(x, y, gElCanvas.width - 20, line.size + 10);
	// 	gCtx.stroke();
	// }

	gCtx.fillText(line.txt, x, y + line.size);
	gCtx.strokeText(line.txt, x, y + line.size);
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

	const newFontSize =
		Number.parseFloat(getComputedStyle(e.target).fontSize, 10) + 4 + 'px';

	sortBy(e.target.value, newFontSize);

	//Increasing the font

	e.target.style.fontSize = newFontSize;

	renderImgs(getImgs());
}

////////////////////// RENDER///////////////////////

// render gallery

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
		// const keywordCapitalized = capitalizeStr(keyword);
		const strHtml = `<button class="btn sort-btn" style="font-size:${fontSize}"  value="${keyword}">${keyword}</button>`;
		elSortBtnsCont.insertAdjacentHTML('afterbegin', strHtml);
		elSearchKeyword.insertAdjacentHTML(
			'afterbegin',
			`<option value="${keyword}"></option>`
		);
	});
}

// render IMAGES

function renderImgs(imgs) {
	const elImgsContainer = document.querySelector('.images-container');
	elImgsContainer.innerHTML = '';

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

// function addListeners() {
// addMouseListeners();s
// 	addTouchListeners();
// 	window.addEventListener('resize', () => {
// 		resizeCanvas();
// 		renderCanvas();
// 	});
// }

// function addMouseListeners() {
// 	gElCanvas.addEventListener('mousemove', onMove);
// 	gElCanvas.addEventListener('mousedown', onDown);
// 	gElCanvas.addEventListener('mouseup', onUp);
// }

// function addTouchListeners() {
// 	gElCanvas.addEventListener('touchmove', onMove);
// 	gElCanvas.addEventListener('touchstart', onDown);
// 	gElCanvas.addEventListener('touchend', onUp);
// }
// function onDown(ev) {
// 	const pos = getEvPos(ev);
// 	if (!isCircleClicked(pos)) return;
// 	setCircleDrag(true);
// 	gStartPos = pos;
// 	document.body.style.cursor = 'grabbing';
// }

// function onMove(ev) {
// 	const circle = getCircle();
// 	if (circle.isDrag) {
// 		const pos = getEvPos(ev);
// 		const dx = pos.x - gStartPos.x;
// 		const dy = pos.y - gStartPos.y;
// 		gStartPos = pos;
// 		moveCircle(dx, dy);
// 		renderCanvas();
// 	}
// }

// function onUp() {
// 	setCircleDrag(false);
// 	document.body.style.cursor = 'grab';
// }

// function calcNextLinePos() {
// 	let pos;
// 	const [width, hight] = [gElCanvas.width, gElCanvas.height];
// 	const lines = getMeme().lines;
// 	if (lines.length === 1) {
// 		pos = {};
// 	}
// }

//Download the meme
function downloadImg(elLink) {
	renderCanvas(true);
	var imgContent = gElCanvas.toDataURL('image/jpeg');
	elLink.href = imgContent;
}
