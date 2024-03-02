import { Scene, PerspectiveCamera, AmbientLight, Vector3 } from 'three';
import { Loop } from './systems/Loop.js';
import { Renderer } from './systems/Renderer.js';
import { Resizer } from './systems/Resizer.js';
import { Particle } from './components/Particle.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { getRandomNumber, getXYZFromSphericalCoords } from './helpers/math.js';

class Universe 
{
    #light;
    #scene;
    #camera;
    #renderer;
    #loop;
    #particles;
    #controls;

    constructor (container)
    {
        this.global_radius = 1000;
        this.gravitational_constant = -1;

        this.max_mass_particles = 500;
        this.min_mass_particles = 10;

        this.max_particle_density = 22.5; // Osmium density
        this.min_particle_density = 1; // Water density

        this.#scene = new Scene ({ background:0x040404 });
        this.#light = new AmbientLight (0xeb9b34, 3);

        this.#renderer = new Renderer ();
        container.append (this.#renderer.domElement);

        this.#camera = new PerspectiveCamera (35, window.innerWidth / window.innerHeight, 0.1, 200000);
        this.#camera.position.set (this.global_radius, this.global_radius, 0);
        this.#camera.lookAt (this.#scene.position);
        this.#controls = new OrbitControls (this.#camera, this.#renderer.domElement);

        this.#loop = new Loop (this.#camera, this.#scene, this.#renderer);

        this.#scene.add (this.#light, this.#camera);

        this.#particles = [];
        //this.addParticle (null, null, 20, 500000, 0x456672);
        this.addNParticles (1000);

        setInterval (()=> 
        {
            let intersected_particle = null;
            for (let i = 0; i < this.#particles.length; i++)
            {
                intersected_particle = this.#particles[i].getFirstIntersectingExternalParticle (this.#particles);

                if (intersected_particle != null)
                {
                    // Collision happened
                    this.bondPairedParticlesAfterInelasticCollision (this.#particles[i],intersected_particle);
                } else {
                    // No collision, so there is a force between them.
                    let force_experienced = 0;
                    force_experienced = this.#particles[i].getForceExperiencedFromExternalParticles (this.#particles);

                    this.#particles[i].force_experienced.x = force_experienced.x;
                    this.#particles[i].force_experienced.y = force_experienced.y;
                    this.#particles[i].force_experienced.z = force_experienced.z;

                    this.#particles[i].acceleration = { 
                        x: this.#particles[i].force_experienced.x / this.#particles[i].mass, 
                        y: this.#particles[i].force_experienced.y / this.#particles[i].mass,
                        z: this.#particles[i].force_experienced.z / this.#particles[i].mass 
                    };
                }
            }
        }, 100);

        new Resizer (container, this.#camera, this.#renderer).setSize ();
    }

    addParticle (position, velocity, radius, mass, color)
    {
        let particle = new Particle (position, velocity, radius, mass, color)
        this.#particles.push (particle);
        this.#scene.add (particle.mesh);

        this.#loop.updatables.push (particle);

        return particle;
    }

    addNParticles (n)
    {
        for (let i = 0; i < n; i++)
        {
            let particle_mass = getRandomNumber (this.min_mass_particles, this.max_mass_particles);
            let particle_density = getRandomNumber (this.min_particle_density, this.max_particle_density);

            let particle_radius = Math.cbrt (particle_mass / (4/3 * particle_density * Math.PI));

            let r = getRandomNumber (100, this.global_radius, 0.001);
            let theta = getRandomNumber (0, 2 * Math.PI, 0.001);
            let phi = getRandomNumber (0, Math.PI, 0.001);

            let particle_position = getXYZFromSphericalCoords (r, theta, phi);
            let particle_velocity = 
            {
                x: 0.25 * getRandomNumber (-20, 20), 
                y: 0.25 * getRandomNumber (-20, 20), 
                z: 0.25 * getRandomNumber (-20, 20)
            };

            particle_velocity = null;

            this.addParticle (particle_position, particle_velocity, particle_radius, particle_mass);
        }
    }

    destroyParticle (particle)
    {
        const index = this.#particles.indexOf (particle);
        if (index > -1) 
        {
            this.#scene.remove (this.#particles[index].mesh); // Remove mesh from scene.
            this.#particles[index] = undefined; // Destroy object to free memory.
            this.#particles.splice (index, 1); // Remove particle from array.
        }
    }

    bondPairedParticlesAfterInelasticCollision (particle_1, particle_2, color_after_collision = 0x34ebba)
    {
        if (particle_1 === particle_2) return;

        if (particle_1.hasParticleBonded (particle_2)) return;

        let paired_particle_position = { 
            x: ((particle_1.mass * particle_1.position.x) + (particle_2.mass * particle_2.position.x)) / (particle_1.mass + particle_2.mass),

            y: ((particle_1.mass * particle_1.position.y) + (particle_2.mass * particle_2.position.y)) / (particle_1.mass + particle_2.mass),

            z: ((particle_1.mass * particle_1.position.z) + (particle_2.mass * particle_2.position.z)) / (particle_1.mass + particle_2.mass)
        };

        let paired_particle_velocity = { 
            x: ((particle_1.mass * particle_1.velocity.x) + (particle_2.mass * particle_2.velocity.x)) / (particle_1.mass + particle_2.mass),

            y: ((particle_1.mass * particle_1.velocity.y) + (particle_2.mass * particle_2.velocity.y)) / (particle_1.mass + particle_2.mass),

            z: ((particle_1.mass * particle_1.velocity.z) + (particle_2.mass * particle_2.velocity.z)) / (particle_1.mass + particle_2.mass)
        };

        let paired_particle_mass = particle_1.mass + particle_2.mass;
        let paired_particle_radius = Math.max (particle_1.radius, particle_2.radius) + Math.min (particle_1.radius, particle_2.radius)/10;

        //paired_particle_radius = Math.max (particle_1.radius, particle_2.radius);

        // Remove particle_ from the universe
        this.destroyParticle (particle_1);
        this.destroyParticle (particle_2);

        // Add the new combined particle with properties of both particles
        this.addParticle (paired_particle_position, paired_particle_velocity, paired_particle_radius, paired_particle_mass, color_after_collision);
    }

    start ()
    {
        this.#loop.start ();
    }

}

export { Universe }