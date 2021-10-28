'use strict';

function capitalizeStr(str) {
	return str.toLowerCase().replace(str[0], str[0].toUpperCase());
}

function getInputsValues(elInputs) {
	const values = Array.from(elInputs).reduce((acc, input) => {
		acc[input.name] = input.value;
		return acc;
	}, {});
	return values;
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
