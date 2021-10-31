'use strict';
const SELECTED_LINE_COLOR = '#111';
const gTouchEvs = ['touchstart', 'touchmove', 'touchend'];
let gIsOnDownload = false;
let gElCanvas;
let gCtx;
let gStartPos;
let gOldText;
let gTxtInput;
let gElEditInputs;
let gElMainSections;
let gElSavedMemesContainer;
let gElImgsContainer;
const gEditBtnsFunctions = {
	add: onAddLine,
	delete: onDeleteLine,
	swap: onNextLine,
	moveLine: onMoveLine,
	textAlign: onAlignTxt,
	changeFontSize: onUpdateFontSize,
};
const gNavLinkSec = {
	save: renderSavedMemes,
	gallery: renderGallery,
	memes: renderMeme,
};

const gOnCanvasBtnsBox = {
	save: onSaveCanvas,
	share: onShare,
};

// LOAD
window.addEventListener('load', function () {
	// Selectors
	gElCanvas = selectEl('#canvas');
	gTxtInput = selectEl('input[name="txt"]');
	gElImgsContainer = selectEl('.images-container');
	gCtx = gElCanvas.getContext('2d');
	gElSavedMemesContainer = document.querySelector('.saved-meme-container');

	gElEditInputs = selectEls('.control-box input');
	renderStart();

	gElMainSections = selectEls('.main-content >*');
	// Event listeners
	(function () {
		generalEventListeners();
		canvasEventListeners();
		galleryEventListeners();
	})();
});

// Render START

function renderStart() {
	selectEl('.main-footer .year').innerText = `${new Date().getFullYear()}`;
	renderFontSize(24);
	renderGallery();
	createImgMeme(1);
	resizeCanvas();
	addListeners();
}

// EVENT LISTENERS

// GENERAL event listeners

function generalEventListeners() {
	// Open MENU in mobile
	setEventListeners('.btn-menu', toggleMenu);
	setEventListeners('.about-btn ,.main-screen', toggleModal);

	// On main nav click
	selectEls('.memes-btn, .btn-gallery, .saved-meme-btn').forEach((btn) =>
		btn.addEventListener('click', (e) => {
			toggleMenu(e);
			toggleMainSection(e);
		})
	);
	setEventListeners('.logo-box', onGallery);
}

// CANVAS event listeners

function canvasEventListeners() {
	setEventListeners('.control-row select', onSelectChange, 'change');
	// Updating the values from the inputs
	gElEditInputs.forEach((input) =>
		input.addEventListener('input', onUpdateValues)
	);
	// EDIT text btns
	const elEditBtns = document.querySelectorAll('.control-row .btn');
	elEditBtns.forEach((btn) => {
		btn.addEventListener('mousedown', onEditClick);
		btn.addEventListener('touchstart', onEditClick);
	});
	setEventListener('.canvas-btns', onCanvasBtnsClicked);
}

// GALLERY event listeners

function galleryEventListeners() {
	const imgs = getImgs();
	const elSearchBar = document.getElementById('keyword-choice');
	elSearchBar.addEventListener('keyup', (e) => {
		const searchStr = e.target.value;
		const filteredImgs = imgs.filter((img) => {
			return img.keywords.join(' ').includes(searchStr);
		});
		renderImgs(filteredImgs);
	});

	setEventListeners('.sort-btns-container, .show-all-btn', onSortImgs);

	// Click on  image
	gElImgsContainer.addEventListener('click', onCreateImgMeme);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// FUNCTIONS

function onUpdateValues(e) {
	if (isMemeNotActive() && !gTxtInput.value) return;
	gOldText = `${getSelectedLine().txt}`;
	updateValues(getInputsValues(gElEditInputs));
	renderFontSize();
	renderCanvas();
}

// Clicking on one of the buttons related to EDITING the text on the canvas

function onEditClick(e) {
	// Checks if there is an active line.
	if (isMemeNotActive()) return;
	const elEditBtn = e.target.closest('.btn');
	const [name, val] = [elEditBtn.name, elEditBtn.value];
	if (elEditBtn.classList.contains('emoji-btn'))
		addLine(val, gElCanvas.height, true);
	else gEditBtnsFunctions[name](val);
	renderCanvas();
}

// On Change font SIZE

function onUpdateFontSize(val) {
	updateFontSize(val === 'increase' ? 1 : -1);
	renderFontSize();
}

// On Align text

function onAlignTxt(val) {
	alignText(val, gElCanvas.width);
}

// On ADD line

function onAddLine() {
	if (!gTxtInput.value) return;
	const inputsVals = getInputsValues(gElEditInputs);
	setTxtInputVal();
	addLine(inputsVals, gElCanvas.height);
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
console.log('e');
// On Select CHANGE

function onSelectChange(e) {
	const styleName = e.target.name.includes('fam') ? 'fontFam' : 'fontStyle';
	changeFontStyle(styleName, e.target.value);
	renderCanvas();
}

// MOVE the text UP

function onMoveLine(val) {
	moveText(val === 'up' ? -5 : 5, gElCanvas.height, 0);
}

// render IMAGES

function renderImgs(imgs) {
	gElImgsContainer.innerHTML = '';
	imgs.forEach((img) => renderImg(img));
}

// render Image

function renderImg(img) {
	const strHtml = `<img  class="img-item" src="${img.url}" alt="" data-img-id="${img.id}">`;
	gElImgsContainer.insertAdjacentHTML('beforeend', strHtml);
}

// Render MEME

function renderMeme() {
	renderActiveSection('.meme-section', '.memes-btn');
}

//////////////////////Move a line by touch / click//////////////////////////

function addListeners() {
	addMouseListeners();
	addTouchListeners();
	window.addEventListener('resize', setCanvas);
}

function addMouseListeners() {
	gElCanvas.addEventListener('mousemove', onMove);
	gElCanvas.addEventListener('mousedown', onDown);
	gElCanvas.addEventListener('mouseup', onUp);
}

function addTouchListeners() {
	gElCanvas.addEventListener('touchmove', onMove);
	gElCanvas.addEventListener('touchstart', onDown);
	gElCanvas.addEventListener('touchend', onUp);
}

function onDown(ev) {
	if (isMemeNotActive()) return;
	const evPos = getEvPos(ev);
	let clickedLine = lineClicked(getLineWidth, evPos);
	if (!clickedLine) return;
	setLineDrag(clickedLine, true);
	gStartPos = evPos;
	gElCanvas.style.cursor = 'grabbing';
}

function onMove(ev) {
	const line = getLineDrag();
	if (isMemeNotActive() || !line?.isDrag) return;
	const pos = getEvPos(ev);
	const [dx, dy] = [pos.x - gStartPos.x, pos.y - gStartPos.y];
	gStartPos = pos;
	moveLine(dx, dy);
	renderCanvas();
}

function onUp() {
	const lineDrag = getLineDrag();
	if (!lineDrag?.isDrag || isMemeNotActive()) return;
	setLineDrag(lineDrag, false);
	gElCanvas.style.cursor = 'grab';
}

//////////////////////////////// CANVAS RENDER////////////////////////////

// Render image canvas
function renderCanvasImg(curImg) {
	const img = new Image();
	img.src = `${curImg.url}`;
	img.onload = () => {
		renderImgToCanvas(img);
		renderLines();
	};
}

// render canvas

function renderCanvas() {
	gCtx.save();
	renderCanvasImg(getCurImg());
	gCtx.restore();
}

// render text

function renderLines() {
	let meme = getMeme();
	meme.lines.forEach((line) => drawText(line));
}

// DRAW text

function drawText(line) {
	gCtx.beginPath();
	let { x, y } = line.pos;
	gCtx.fillStyle = line.fill;
	gCtx.strokeStyle = line.stroke;
	gCtx.font = `${line.fontStyle} ${line.size}px ${line.fontFam}`;
	gCtx.textAlign = line.textAlign;
	gCtx.fillText(line.txt, x, y + line.size);
	gCtx.strokeText(line.txt, x, y + line.size);
}

// Render FONT SIZE
function renderFontSize(size = getSelectedLine().size) {
	selectEl('.font-size-label').innerText = size;
	selectEl('#fontSizeRange').value = size;
}

//////////////////////////////////////// GALLERY ////////////////////////////////////////

// LOAD image !

function onImgInput(ev) {
	loadImageFromInput(ev, renderImgToCanvas);
}

function loadImageFromInput(ev, onImageReady) {
	document.querySelector('.share-container').innerHTML = '';
	var reader = new FileReader();

	reader.onload = function (event) {
		var img = new Image();
		img.onload = onImageReady.bind(null, img);
		img.src = event.target.result;
		setCurImg({ url: event.target.result });
		setCurMeme(createMeme(-1));
		toggleMainSection();
		setCanvas();
	};
	reader.readAsDataURL(ev.target.files[0]);
}

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
	if (!elTarget.src) return;
	toggleMainSection();
	gTxtInput.value = '';
	createImgMeme(elTarget.getAttribute('data-img-id'));
	setCanvas();
}

function onGallery(e) {
	if (hasClass(selectEl('.main-nav .btn-gallery'), 'active')) return;
	hideAllMainSections();
	renderActiveSection('.gallery-section-container', '.btn-gallery');
	renderSearchFilterContainer();
	renderImgs(getImgs());
}

////////////////////// RENDER///////////////////////

// Render gallery

function renderGallery() {
	renderActiveSection('.gallery-section-container', '.btn-gallery');
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

//////////////////////////////////////// SAVE //////////////////////////////////////

// Render SAVED MEMES

function renderSavedMemes() {
	renderActiveSection('.saved-memes-section', '.saved-meme-btn');
	const elNoMemesContainer = selectEl('.no-saved-memes-container');
	gElSavedMemesContainer.innerHTML = '';
	const memeImages = getSavedMemes();
	if (!memeImages || !memeImages.length) {
		elNoMemesContainer.classList.remove('hidden');
		return;
	}
	elNoMemesContainer.classList.add('hidden');
	memeImages.forEach((meme, i) => renderSavedMeme(meme, i));
	setEventListeners('.saved-meme-box', onSavedMemeClicked);
}

// Render saved MEME

function renderSavedMeme(meme, idx) {
	const strHtml = `
		<div class="saved-meme-box flex column space-between">
    	    <img  class="img-item" src="${meme.src}" data-meme-idx="${idx}"/>
			<div class="save-btns-box flex column">
				<button class="btn btn-orange-white edit-saved-meme" data-meme-idx="${idx}">Edit</button>
				<button class="btn btn-orange-white remove-saved-meme" data-meme-idx="${idx}">Remove</button>
			</div>
		</div>`;
	gElSavedMemesContainer.insertAdjacentHTML('beforeend', strHtml);
}

function onSavedMemeClicked(e) {
	if (e.target.innerText === 'Remove') {
		onRemoveSavedMeme(e);
		return;
	}
	onEditSavedMeme(e);
}

// ON Edit SAVED meme

function onEditSavedMeme(e) {
	const memeIdx = +e.target.getAttribute('data-meme-idx');
	const savedMemes = getSavedMemes();
	setCurImg(savedMemes[memeIdx].curImg);
	setCurMeme(savedMemes[memeIdx].meme);
	toggleMainSection();
	renderInputs(getSelectedLine());
	setCanvas();
}

// Remove

function onRemoveSavedMeme(e) {
	const memeIdx = +e.target.getAttribute('data-meme-idx');
	removeSavedMeme(memeIdx);
	renderSavedMemes();
}

// /////////////////////////

//Download the meme

function downloadImg(elLink) {
	// await setCanvas();
	let imgContent = gElCanvas.toDataURL('image/jpeg');
	elLink.href = imgContent;
}

// ON canvas buttons clicked

function onCanvasBtnsClicked(e) {
	if (e.target.href) return;
	gOnCanvasBtnsBox[e.target.innerText.toLowerCase()](e);
}

// On SAVE canvas

function onSaveCanvas(e) {
	const dataURI = gElCanvas.toDataURL();
	saveCanvas(dataURI, new Date());
	hideAllMainSections();
	renderSavedMemes();
}

// On SHARE

async function onShare(e) {
	if (hasClass(e.target, 'not-allowed')) return;
	const image = await fetch(gElCanvas.toDataURL());
	const blob = await image.blob();
	const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
	try {
		await navigator.share({ text: 'My_meme', files: [file] });
	} catch (err) {
		// console.error(new Error('Your browser does not support this feature'));
		alert('Your browser does not support this feature');
		e.target.classList.add('not-allowed');
	}
}
//////////////////////////////////////////////////Auxiliary functions//////////////////////////////////

// Toggle MAIN SECTION

function toggleMainSection(e) {
	if (e && hasClass(e.target, 'active')) return;
	hideAllMainSections();
	if (!e) {
		renderMeme();
		return;
	}
	gNavLinkSec[e.target.innerText.toLowerCase()]();
}

function renderActiveSection(containerClass, btnClass) {
	selectEl(`.main-nav ${btnClass}`).classList.add('active');
	selectEl(containerClass).classList.remove('hidden');
}

// HIDE ALL main sections

function hideAllMainSections() {
	gElMainSections.forEach((sec) => sec.classList.add('hidden'));
	document
		.querySelectorAll('.main-nav .link')
		.forEach((link) => link.classList.remove('active'));
}

// Render the image to the canvas.

function renderImgToCanvas(img) {
	let { width: w } = gElCanvas;
	let [nw, nh] = [img.naturalWidth, img.naturalHeight];
	// Aspect ratio of this image
	let aspect = nw / nh;
	let h = w / aspect;
	// Sets canvas height
	gElCanvas.height = h;
	gCtx.drawImage(img, 0, 0, w, h);
}

function setTxtInputVal(txt = '') {
	gTxtInput.value = txt;
}

// Resize canvas

function resizeCanvas() {
	const elContainer = selectEl('.canvas-container');
	[gElCanvas.width, gElCanvas.height] = [
		elContainer.offsetWidth,
		elContainer.offsetHeight,
	];
}

// Set CANVAS

function setCanvas() {
	resizeCanvas();
	renderCanvas();
}

// Toggle Modal

function toggleModal(e) {
	document.body.classList.toggle('modal-open');
}

// Toggle MENU(mobile only)

function toggleMenu(e) {
	document.body.classList.toggle('menu-open');
}

// Get line width

function getLineWidth(txt) {
	let metrics = gCtx.measureText(txt);
	return metrics.width;
}

// Sets the inputs in the meme section to match a specific line

function renderInputs(line) {
	gElEditInputs.forEach((input) => {
		input.value = line[input.name];
	});
}

// Has Class

function hasClass(el, className) {
	return el.classList.contains(className);
}

// Get the POSITION that the user clicked on the canvas.

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

function drawRect(x, y, height, txt) {
	gCtx.beginPath();
	let metrics = gCtx.measureText(txt);
	let w = metrics.width;
	gCtx.rect(x, y, w, y + height);
	gCtx.fillStyle = '#f7f7f7';
	gCtx.fillRect(x, y, w, y + height);
}
