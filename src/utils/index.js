/**
 * 深度克隆
 * @param {*} source 
 */
const deepClone = (source) => {
	if (!source && typeof source !== 'object') {
		throw new Error('error arguments', 'deepClone');
	}
	const targetObj =

			source.constructor === Array ? [] :
			{};

	Object.keys(source).forEach((keys) => {
		if (source[keys] && typeof source[keys] === 'object') {
			targetObj[keys] = deepClone(source[keys]);
		} else {
			targetObj[keys] = source[keys];
		}
	});
	return targetObj;
};

module.exports = {
	deepClone
};
