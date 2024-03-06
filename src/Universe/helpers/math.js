/*function getRandomNumber (min, max, epsilon = 0) 
{
    return Math.random() * ((max - epsilon) - (min + epsilon)) + (min + epsilon);
}*/

// The random number can be equal to min or to max if and only if epsilon = 0.
function getRandomNumber (min, max, epsilon = 0)
{
    // Generate a random 32-bit integer using crypto.getRandomValues
    const array = new Uint32Array (1);
    window.crypto.getRandomValues (array);

    // Convert the random integer to a float in [0, 1)
    const maxUint32 = 2 ** 32;
    const randomFloat = array[0] / maxUint32;

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

function getAverageOfArrayNumbers (numbers)
{
    let sum = 0;
    let total_numbers = numbers.length;

    for (let i = 0; i < total_numbers; i++)
    {
        sum += numbers[i];
    }

    return (sum / total_numbers);
}

function getLengthOfN3DVectorsSum (vectors)
{
    let resulting_vector = { x: 0, y: 0, z: 0 };
    
    for (let i = 0; i < vectors.length; i++)
    {
        resulting_vector.x += vectors[i].x;
        resulting_vector.y += vectors[i].y;
        resulting_vector.z += vectors[i].z;
    }

    return Math.sqrt ((resulting_vector.x)**2 + (resulting_vector.y)**2 + (resulting_vector.z)**2);
}

export { getRandomNumber, getXYZFromSphericalCoords, getDistanceBetweenTwoPoints, getLengthOfN3DVectorsSum, getAverageOfArrayNumbers }