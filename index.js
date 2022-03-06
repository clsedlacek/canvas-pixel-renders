(() => {
	let currentRenderMode;
	let random = [];

	// ken perlin permutation table in original arrangement (0-255 inclusive array 256 length)
	const permutation = [151, 160, 137, 91, 90, 15,
	    131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
	    190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
	    88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
	    77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
	    102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
	    135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
	    5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
	    223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
	    129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
	    251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
	    49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
	    138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
	];
	// double length table to prevent lookup overflows
	const p = [];
	for (let i=0; i<512; i++) {
		p.push(permutation[i % 256]);
	}

	// repopulate random number table (does not affect permutation table)
	function seedRandom() {
		random = [];
		for (let i=0; i<permutation.length; i++) {
			random.push(Math.random());
		}
	}

	// switch currently rendered mode
	function setRenderMode(id) {
		if (renderModes[id] && renderModes[id].render) {
			currentRenderMode = renderModes[id];
		}
	}

	// linear interpolation
	function lerp(a, b, x) {
		return a+x*(b-a);
	}

	const renderModes = [];
	// trippy cycling circles
	renderModes[0] = {
		name: 'Trippy swirls',
		render: function(x, y, timestamp) {
			// slow down time iteration
			const t = timestamp/8;
			const xf = x/2;
			const yf = y/2;

			const value = {
				red: Math.floor((255 + (xf)) % 255),
				green: Math.floor((255 + (xf*yf*42) + t) % 255),
				blue: Math.floor((255 + (yf * (Math.sin(t*0.0055)))) % 255),
				alpha: 255
			}
			return value;
		}
	}
	// stripes
	renderModes[1] = {
		name: 'BW stripes',
		render: function(x, y, timestamp) {
			const len = random.length;
			const hash = (len + x + y) % len;
			const intensity = random[hash];

			const value = {
				red: 255 * intensity,
				green: 255 * intensity,
				blue: 255 * intensity,
				alpha: 255
			}
			return value;
		}
	}
	// black and white random noise
	renderModes[2] = {
		name: 'BW White noise',
		render: function(x, y, timestamp) {
			const xi = parseInt(x) & 255;
			const yi = parseInt(y) & 255;
			const hash = permutation[permutation[xi] + permutation[yi]];
			const intensity = random[hash];

			const value = {
				red: 255 * intensity,
				green: 255 * intensity,
				blue: 255 * intensity,
				alpha: 255
			}
			return value;
		}
	}
	// color gradient tiling noise
	renderModes[3] = {
		name: 'RGB gradient tiling noise',
		render: function(x, y, timestamp) {
			const xw = x & 255;
			const yw = y & 255;

			const xi = parseInt(xw);
			const yi = parseInt(yw);
			const xt = xw - xi;
			const yt = yw - yi;

			const aa = random[p[p[xi] + p[yi]]];
			const ba = random[p[p[xi+1] + p[yi]]];

			const ab = random[p[p[xi] + p[yi+1]]];
			const bb = random[p[p[xi+1] + p[yi+1]]];

			const x1 = lerp(aa, ba, xt);
			const x2 = lerp(ab, ba, xt);
			const y1 = lerp(x1, x2, yt);

			const intensity = y1;

			const value = {
				red: (xw * intensity),
				green: (yw * intensity),
				blue: (255 * intensity),
				alpha: 255
			}
			return value;
		}
	}
	// eye burn seizure-tastic animated noise
	renderModes[4] = {
		name: 'RGB eyeburn (SEIZURE TIME WARNING)',
		render: function(x, y, timestamp) {
			const xw = x & 255;
			const yw = y & 255;

			const xi = parseInt(xw);
			const yi = parseInt(yw);
			const xt = xw - xi;
			const yt = yw - yi;

			const aa = random[p[p[xi] + p[yi]]];
			const ba = random[p[p[xi+1] + p[yi]]];

			const ab = random[p[p[xi] + p[yi+1]]];
			const bb = random[p[p[xi+1] + p[yi+1]]];

			const x1 = lerp(aa, ba, xt);
			const x2 = lerp(ab, ba, xt);
			const y1 = lerp(x1, x2, yt);

			const intensity = y1;

			const t = timestamp/8;

			const value = {
				red: (255 + (x * intensity / 2 * t)) % 255,
				green: (255 + (y * intensity / 2 * t)) % 255,
				blue: (255 + (255 * intensity / 2 * t)) % 255,
				alpha: 255
			}
			return value;
		}
	}
	// nice gradient on noise
	renderModes[5] = {
		name: 'RGB noise gradient',
		render: function(x, y, timestamp) {
			const xw = x & 255;
			const yw = y & 255;

			const xi = parseInt(xw);
			const yi = parseInt(yw);
			const xt = xw - xi;
			const yt = yw - yi;

			const aa = random[p[p[xi] + p[yi]]];
			const ba = random[p[p[xi+1] + p[yi]]];

			const ab = random[p[p[xi] + p[yi+1]]];
			const bb = random[p[p[xi+1] + p[yi+1]]];

			const x1 = lerp(aa, ba, xt);
			const x2 = lerp(ab, ba, xt);
			const y1 = lerp(x1, x2, yt);

			const intensity = y1;

			const t = timestamp/8;

			const value = {
				red: (255 + (x * intensity / 2)) % 255,
				green: (255 + (y * intensity / 2)) % 255,
				blue: (255 + (255 * intensity / 2)) % 255,
				alpha: 255
			}
			return value;
		}
	}
	// pixel noise using repeatable lattice
	renderModes[6] = {
		name: 'RGB pixel noise',
		render: function(x, y, timestamp) {
			const latticeSize = 20;
			const steps = 255;
			const xSteps = x / (steps) * latticeSize;
			const ySteps = y / (steps) * latticeSize;
			const xw = xSteps & 255;
			const yw = ySteps & 255;

			const xi = parseInt(xw);
			const yi = parseInt(yw);
			const xt = xw - xi;
			const yt = yw - yi;

			const aa = random[p[p[xi] + p[yi]]];
			const ba = random[p[p[xi+1] + p[yi]]];

			const ab = random[p[p[xi] + p[yi+1]]];
			const bb = random[p[p[xi+1] + p[yi+1]]];

			const x1 = lerp(aa, ba, xt);
			const x2 = lerp(ab, ba, xt);
			const y1 = lerp(x1, x2, yt);

			const intensity = y1;

			const t = timestamp/8;

			const value = {
				red: (255 + (x * intensity / 2)) % 255,
				green: (255 + (y * intensity / 2)) % 255,
				blue: (255 + (255 * intensity / 2)) % 255,
				alpha: 255
			}
			return value;
		}
	}

	function drawPixels(canvas, timestamp, renderMode) {
		const ctx = canvas.getContext('2d');
		const width = canvas.width;
		const height = canvas.height;
		const imageData = ctx.getImageData(0, 0, width, height);
		const sourceData = imageData.data;
		for (let i=0; i<sourceData.length; i+=4) {
			const pixelNum = i/4;
			const y = Math.floor(pixelNum/imageData.width);
			const x = pixelNum - (y * imageData.width);
			const noise = renderMode.render(x, y, timestamp);
			sourceData[i] = noise.red;
			sourceData[i+1] = noise.green;
			sourceData[i+2] = noise.blue;
			sourceData[i+3] = noise.alpha;
		}
		ctx.putImageData(imageData, 0, 0);
	}

	function drawLoop(canvas, timestamp) {
		drawPixels(canvas, timestamp, currentRenderMode);

		window.requestAnimationFrame((timestamp) => {
			drawLoop(canvas, timestamp);
		});
	}

	function initDraw(canvas) {
		window.requestAnimationFrame((timestamp) => {
			drawLoop(canvas, timestamp);
		});
	}

	function populateRenderModeOptions(renderModeSelect) {
		while (renderModeSelect.firstChild) {
			renderModeSelect.removeChild(renderModeSelect.lastChild);
		}
		for (let i=0; i<renderModes.length; i++) {
			const modeOpt = document.createElement('option');
			modeOpt.value = i;
			renderModeSelect.appendChild(modeOpt);

			const modeOptTextNode = document.createTextNode(renderModes[i].name || 'Untitled');
			modeOpt.appendChild(modeOptTextNode);
		}
	}

	function initControls() {
		const renderModeSelect = document.getElementById('render-mode');
		populateRenderModeOptions(renderModeSelect);
		renderModeSelect.addEventListener('change', (e) => {
			const renderId = parseInt(renderModeSelect.value);
			if (!isNaN(renderId)) {
				setRenderMode(renderId);
			}
		});
		const reseedButton = document.getElementById('reseed-rng');
		reseedButton.addEventListener('click', (e) => {
			e.preventDefault();
			seedRandom();
		});
	}

	function init() {
		const canvas = document.getElementById('canvas');
		canvas.width = 500;
		canvas.height = 500;
		seedRandom();
		setRenderMode(1);
		initDraw(canvas);
		initControls();
		console.log('Ready');
	}

	init();

})();