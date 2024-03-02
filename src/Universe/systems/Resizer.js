function setSize (camera, container, renderer)
{
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize (container.clientWidth, container.clientHeight);
    renderer.setPixelRatio (window.devicePixelRatio);
}

class Resizer
{
	constructor (container, camera, renderer)
	{
		this.container = container;
        this.camera = camera;
        this.renderer = renderer;
	}

    setSize ()
    {
        setSize (this.camera, this.container, this.renderer);

        window.addEventListener ("resize", e => 
        {
            setSize (this.camera, this.container, this.renderer);
        });
    }
}

export { Resizer }