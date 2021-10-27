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
