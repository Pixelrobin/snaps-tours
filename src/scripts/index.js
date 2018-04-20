import Glide from '@glidejs/glide';

window.addEventListener('load', () => {
	const glideElement = document.getElementById('glide');

	const glide = new Glide('.glide', {
		perView: 1,
		type: 'carousel',
		focusAt: 'center'
	});

	glide.on(['resize', 'mount.before'], () => {
		let width = window.innerWidth;
		if (width < 750) width = 750;

		const peek = (width - 700) / 2;
		
		glide.update({
			peek: peek
		});
	});
	
	glide.mount();
});