<div class="scene">
	<div class="plane">
		<div class="cube cube--0">
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
		</div>
		<div class="shadow shadow--0"></div>
		<div class="cube cube--1">
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
		</div>
		<div class="shadow shadow--1"></div>
		<div class="cube cube--2">
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
		</div>
		<div class="shadow shadow--2"></div>
		<div class="cube cube--3">
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
		</div>
		<div class="shadow shadow--3"></div>
		<div class="cube cube--4">
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
		</div>
		<div class="shadow shadow--4"></div>
		<div class="cube cube--5">
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
		</div>
		<div class="shadow shadow--5"></div>
		<div class="cube cube--6">
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
		</div>
		<div class="shadow shadow--6"></div>
		<div class="cube cube--7">
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
			<div class="cube__side"></div>
		</div>
		<div class="shadow shadow--7"></div>
	</div>
</div>

<style>
	*,
	*:after,
	*:before {
		box-sizing: border-box;
	}

	:root {
		--hue: 212;
		--radius: 5.5;
		--size: 3;
	}

	.scene {
		transform: scale(0.6);
		perspective: 800px;
		transform-style: preserve-3d;
		height: 100px;
		width: 100px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.plane {
		height: 5vmin;
		width: 5vmin;
		transform-style: preserve-3d;
		transform: rotateX(-40deg) rotateY(-45deg) rotateX(90deg);
	}
	.cube,
	.shadow {
		--width: var(--size);
		--height: var(--size);
		--depth: var(--size);
		height: calc(var(--depth) * 1vmin);
		width: calc(var(--width) * 1vmin);
		transform-style: preserve-3d;
		position: absolute;
		font-size: 1rem;
		animation: jump 0.8s calc(var(--d) * 1s) infinite;
		transform: translate3d(
			calc((var(--x) * var(--radius)) * 1vmin),
			calc((var(--y) * var(--radius)) * -1vmin),
			0
		);
	}
	.cube > div:nth-of-type(1) {
		background: hsl(var(--hue), 60%, 50%);
		height: calc(var(--height) * 1vmin);
		width: 100%;
		transform-origin: 50% 50%;
		transform: rotateX(-90deg);
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) rotateX(-90deg)
			translate3d(0, 0, calc((var(--depth) / 2) * 1vmin));
	}
	.cube > div:nth-of-type(2) {
		background: hsl(var(--hue), 60%, 60%);
		height: calc(var(--height) * 1vmin);
		width: 100%;
		transform-origin: 50% 50%;
		transform: translate(-50%, -50%) rotateX(-90deg) rotateY(180deg)
			translate3d(0, 0, calc((var(--depth) / 2) * 1vmin));
		position: absolute;
		top: 50%;
		left: 50%;
	}
	.cube > div:nth-of-type(3) {
		background: hsl(var(--hue), 60%, 60%);
		height: calc(var(--height) * 1vmin);
		width: calc(var(--depth) * 1vmin);
		transform: translate(-50%, -50%) rotateX(-90deg) rotateY(90deg)
			translate3d(0, 0, calc((var(--width) / 2) * 1vmin));
		position: absolute;
		top: 50%;
		left: 50%;
	}
	.cube > div:nth-of-type(4) {
		background: hsl(var(--hue), 60%, 55%);
		height: calc(var(--height) * 1vmin);
		width: calc(var(--depth) * 1vmin);
		transform: translate(-50%, -50%) rotateX(-90deg) rotateY(-90deg)
			translate3d(0, 0, calc((var(--width) / 2) * 1vmin));
		position: absolute;
		top: 50%;
		left: 50%;
	}
	.cube > div:nth-of-type(5) {
		background: hsl(var(--hue), 60%, 45%);
		height: calc(var(--depth) * 1vmin);
		width: calc(var(--width) * 1vmin);
		transform: translate(-50%, -50%) translate3d(0, 0, calc((var(--height) / 2) * 1vmin));
		position: absolute;
		top: 50%;
		left: 50%;
	}
	.cube > div:nth-of-type(6) {
		background: hsl(var(--hue), 60%, 65%);
		height: calc(var(--depth) * 1vmin);
		width: calc(var(--width) * 1vmin);
		transform: translate(-50%, -50%) translate3d(0, 0, calc((var(--height) / 2) * -1vmin))
			rotateX(180deg);
		position: absolute;
		top: 50%;
		left: 50%;
	}
	.shadow {
		animation: none;
		background: radial-gradient(#000, transparent);
		transform: translate3d(
				calc((var(--x) * var(--radius)) * 1vmin),
				calc((var(--y) * var(--radius)) * -1vmin),
				calc(var(--size) * -0.5vmin)
			)
			scale(1);
		animation: shadow 0.8s calc(var(--d) * 1s) infinite;
	}
	.cube--0,
	.shadow--0 {
		--x: 1;
		--y: 0;
		--d: -0.7;
	}
	.cube--1,
	.shadow--1 {
		--x: 1;
		--y: -1;
		--d: -0.6;
	}
	.cube--2,
	.shadow--2 {
		--x: 0;
		--y: -1;
		--d: -0.5;
	}
	.cube--3,
	.shadow--3 {
		--x: -1;
		--y: -1;
		--d: -0.4;
	}
	.cube--4,
	.shadow--4 {
		--x: -1;
		--y: 0;
		--d: -0.3;
	}
	.cube--5,
	.shadow--5 {
		--x: -1;
		--y: 1;
		--d: -0.2;
	}
	.cube--6,
	.shadow--6 {
		--x: 0;
		--y: 1;
		--d: -0.1;
	}
	.cube--7,
	.shadow--7 {
		--x: 1;
		--y: 1;
		--d: 0;
	}
	@-moz-keyframes jump {
		0%,
		30%,
		100% {
			transform: translate3d(
				calc((var(--x) * var(--radius)) * 1vmin),
				calc((var(--y) * var(--radius)) * -1vmin),
				0
			);
		}
		15% {
			transform: translate3d(
				calc((var(--x) * var(--radius)) * 1vmin),
				calc((var(--y) * var(--radius)) * -1vmin),
				3.5vmin
			);
		}
	}
	@-webkit-keyframes jump {
		0%,
		30%,
		100% {
			transform: translate3d(
				calc((var(--x) * var(--radius)) * 1vmin),
				calc((var(--y) * var(--radius)) * -1vmin),
				0
			);
		}
		15% {
			transform: translate3d(
				calc((var(--x) * var(--radius)) * 1vmin),
				calc((var(--y) * var(--radius)) * -1vmin),
				3.5vmin
			);
		}
	}
	@-o-keyframes jump {
		0%,
		30%,
		100% {
			transform: translate3d(
				calc((var(--x) * var(--radius)) * 1vmin),
				calc((var(--y) * var(--radius)) * -1vmin),
				0
			);
		}
		15% {
			transform: translate3d(
				calc((var(--x) * var(--radius)) * 1vmin),
				calc((var(--y) * var(--radius)) * -1vmin),
				3.5vmin
			);
		}
	}
	@keyframes jump {
		0%,
		30%,
		100% {
			transform: translate3d(
				calc((var(--x) * var(--radius)) * 1vmin),
				calc((var(--y) * var(--radius)) * -1vmin),
				0
			);
		}
		15% {
			transform: translate3d(
				calc((var(--x) * var(--radius)) * 1vmin),
				calc((var(--y) * var(--radius)) * -1vmin),
				3.5vmin
			);
		}
	}
	@-moz-keyframes shadow {
		0%,
		30%,
		100% {
			transform: translate3d(
					calc((var(--x) * var(--radius)) * 1vmin),
					calc((var(--y) * var(--radius)) * -1vmin),
					calc(var(--size) * -0.5vmin)
				)
				scale(1);
		}
		15% {
			transform: translate3d(
					calc((var(--x) * var(--radius)) * 1vmin),
					calc((var(--y) * var(--radius)) * -1vmin),
					calc(var(--size) * -0.5vmin)
				)
				scale(0.85);
			opacity: 0.2;
		}
	}
	@-webkit-keyframes shadow {
		0%,
		30%,
		100% {
			transform: translate3d(
					calc((var(--x) * var(--radius)) * 1vmin),
					calc((var(--y) * var(--radius)) * -1vmin),
					calc(var(--size) * -0.5vmin)
				)
				scale(1);
		}
		15% {
			transform: translate3d(
					calc((var(--x) * var(--radius)) * 1vmin),
					calc((var(--y) * var(--radius)) * -1vmin),
					calc(var(--size) * -0.5vmin)
				)
				scale(0.85);
			opacity: 0.2;
		}
	}
	@-o-keyframes shadow {
		0%,
		30%,
		100% {
			transform: translate3d(
					calc((var(--x) * var(--radius)) * 1vmin),
					calc((var(--y) * var(--radius)) * -1vmin),
					calc(var(--size) * -0.5vmin)
				)
				scale(1);
		}
		15% {
			transform: translate3d(
					calc((var(--x) * var(--radius)) * 1vmin),
					calc((var(--y) * var(--radius)) * -1vmin),
					calc(var(--size) * -0.5vmin)
				)
				scale(0.85);
			opacity: 0.2;
		}
	}
	@keyframes shadow {
		0%,
		30%,
		100% {
			transform: translate3d(
					calc((var(--x) * var(--radius)) * 1vmin),
					calc((var(--y) * var(--radius)) * -1vmin),
					calc(var(--size) * -0.5vmin)
				)
				scale(1);
		}
		15% {
			transform: translate3d(
					calc((var(--x) * var(--radius)) * 1vmin),
					calc((var(--y) * var(--radius)) * -1vmin),
					calc(var(--size) * -0.5vmin)
				)
				scale(0.85);
			opacity: 0.2;
		}
	}
</style>
