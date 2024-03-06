import { SphereGeometry, Mesh, MeshPhysicalMaterial } from "three";
import { getDistanceBetweenTwoPoints } from "../helpers/math.js";

class Particle
{
    constructor (position = null, velocity = null, radius = 1, mass = 5, color = 0xff0000)
    {
        this.position = position == null ? { x: 0, y: 0, z: 0 } : position;
        this.velocity = velocity == null ? { x: 0, y: 0, z: 0 } : velocity;
        this.mass = mass;
        this.radius = radius;
        this.force_experienced = { x: 0, y: 0, z: 0 };
        this.acceleration = { 
            x: this.force_experienced.x / this.mass, 
            y: this.force_experienced.y / this.mass,
            z: this.force_experienced.z / this.mass 
        };
        
        this.mesh = new Mesh (
            new SphereGeometry (this.radius, 16, 16),
            new MeshPhysicalMaterial ({ color: color, clearcoat: 0.8 })
        );

        this.mesh.position.set (this.position.x, this.position.y, this.position.z);
    }

    hasParticleBonded (particle)
    {
        if (particle.position == this.position) return true;
        else return false;
    }

    isIntersectingWithExternalParticle (external_particle)
    {
        if (external_particle === this)
        {
            return false;
        }

        let is_intersecting = false;
        let distance_with_particle = getDistanceBetweenTwoPoints (this.position, external_particle.position);

        if (distance_with_particle < (this.radius + external_particle.radius))
        {
            is_intersecting = true;
        }

        return is_intersecting;
    }

    getFirstIntersectingExternalParticle (external_particles)
    {
        let first_intersecting_external_particle = null;
        for (let i = 0; i < external_particles.length; i++)
        {
            if (this.isIntersectingWithExternalParticle (external_particles[i]))
            {
                first_intersecting_external_particle = external_particles[i];
                break;
            }
        }

        return first_intersecting_external_particle;
    }

    getAllIntersectingExternalParticles (external_particles)
    {
        let intersecting_external_particles = [];
        for (let i = 0; i < external_particles.length; i++)
        {
            if (this.isIntersectingWithExternalParticle (external_particles[i]))
            {
                intersecting_external_particles.push (external_particles[i]);
            }
        }

        return intersecting_external_particles;
    }

    getForceExperiencedFromExternalParticles (external_particles, gravitational_constant = -1)
    {
        let external_force = { x: 0, y: 0, z: 0 };

        let intersecting_particles = this.getAllIntersectingExternalParticles (external_particles);
        intersecting_particles = new Set (intersecting_particles);
        
        // Interacting (distant) particles are all external particles minus the intersecting ones.
        let interacting_particles = external_particles.filter (particle => !intersecting_particles.has (particle));

        let distance_pow_3 = 0;

        for (let i = 0; i < interacting_particles.length; i++)
        {
            if (interacting_particles[i] === this)
            {
                continue;
            }

            distance_pow_3 = (getDistanceBetweenTwoPoints (this.position, interacting_particles[i].position)) ** 3;

            external_force.x += gravitational_constant * this.mass * interacting_particles[i].mass * (this.position.x - interacting_particles[i].position.x) / distance_pow_3;

            external_force.y += gravitational_constant * this.mass * interacting_particles[i].mass * (this.position.y - interacting_particles[i].position.y) / distance_pow_3;

            external_force.z += gravitational_constant * this.mass * interacting_particles[i].mass * (this.position.z - interacting_particles[i].position.z) / distance_pow_3;
        }

        return external_force;
    }

    getInstantSpeed ()
    {
        return Math.sqrt ((this.velocity.x)**2 + (this.velocity.y)**2 + (this.velocity.z)**2);
    }

    tick (delta)
    {
        this.velocity.x += this.acceleration.x * delta;
        this.position.x += this.velocity.x * delta + 0.5 * this.acceleration.x * (delta**2);
        this.mesh.position.x = this.position.x;

        this.velocity.y += this.acceleration.y * delta;
        this.position.y += this.velocity.y * delta + 0.5 * this.acceleration.y * (delta**2);
        this.mesh.position.y = this.position.y;

        this.velocity.z += this.acceleration.z * delta;
        this.position.z += this.velocity.z * delta + 0.5 * this.acceleration.z * (delta**2);
        this.mesh.position.z = this.position.z;
    }
}

export { Particle };