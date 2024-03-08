function removeObjectFromArray (object_to_remove, array)
{
    const index = array.indexOf (object_to_remove);
    if (index > -1) 
    {
        array[index] = undefined;
        array.splice (index, 1);
    }

    return array;
}

function removeMeshFromScene (mesh, scene)
{
    scene.remove (mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();

    return scene;
}

export { removeObjectFromArray, removeMeshFromScene };