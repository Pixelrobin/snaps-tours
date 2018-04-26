import Glide from '@glidejs/glide';

window.addEventListener('DOMContentLoaded', () => {
	const glideElement = document.getElementById('glide');

	const glide = new Glide('.glide', {
		perView: 1,
		type: 'carousel',
		focusAt: 'center',
		autoplay: '2500',
		hoverpause: true
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

	const catchers = document.getElementsByClassName('glide__slide');

	for (let c = 0; c < catchers.length; c ++) {
		catchers[ c ].addEventListener('click', (e) => {
			const classIndex
				= catchers[c].className.indexOf('glide__slide--active');
			
			if (classIndex === -1) {
				glide.go(
					`=${ parseInt(catchers[c].getAttribute('data-index')) }`
				);
				
				e.preventDefault();
			}
		})
	}
});