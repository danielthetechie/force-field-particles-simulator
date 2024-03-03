// The random number can be equal to min or to max if and only if epsilon = 0.
/*function getRandomNumber (min, max, epsilon = 0) 
{
    return Math.random() * ((max - epsilon) - (min + epsilon)) + (min + epsilon);
}*/

function getRandomNumber (min, max, epsilon = 0) {
    // Generate a random 32-bit integer using crypto.getRandomValues
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);

    // Convert the random integer to a float in [0, 1)
    const maxUint32 = 2 ** 32;
    const randomFloat = array[0] / maxUint32;

    // Adjust the range of the random number according to min, max, and epsilon
    return (randomFloat * ((max - epsilon) - (min + epsilon))) + (min + epsilon);
}



function getXYZFromSphericalCoords (r, theta, phi)
{
    return {
        x: r * Math.sin (theta) * Math.cos (phi),
        y: r * Math.sin (theta) * Math.sin (phi),
        z: r * Math.cos (theta)
    };
}

function getDistanceBetweenTwoPoints (p1, p2)
{
    return Math.sqrt ((p1.x - p2.x)**2 + (p1.y - p2.y)**2 + (p1.z - p2.z)**2);
}

export { getRandomNumber, getXYZFromSphericalCoords, getDistanceBetweenTwoPoints }