import { Universe } from "./Universe/Universe.js";

document.addEventListener ("DOMContentLoaded", e => 
{
	let container = document.getElementById ("scene-container");
	const universe = new Universe (container);
	universe.start ();
});