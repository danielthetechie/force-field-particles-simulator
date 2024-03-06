import { Scene, PerspectiveCamera, AmbientLight, Vector3 } from 'three';
import { Loop } from './systems/Loop.js';
import { Renderer } from './systems/Renderer.js';
import { Resizer } from './systems/Resizer.js';
import { Particle } from './components/Particle.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { getRandomNumber, getXYZFromSphericalCoords, getLengthOfN3DVectorsSum } from './helpers/math.js';

class Universe 
{
    #light;
    #scene;
    #camera;
    #renderer;
    #loop;
    #particles;
    #controls;

    constructor ({container, renderer = null, gravitational_constant = -1, global_radius = 200, particles_initial_distance_from_origin = 0, particles_initial_max_speed_per_axis = 0, number_of_particles = 100, max_mass_particles = 10, min_mass_particles = 3 })
    {
        this.gravitational_constant = gravitational_constant;
        console.log (this.gravitational_constant)
        this.global_radius = global_radius;
        this.particles_initial_distance_from_origin = particles_initial_distance_from_origin;
        this.particles_initial_max_velocity_per_axis = particles_initial_max_speed_per_axis;

        if (this.particles_initial_distance_from_origin >= this.global_radius)
        {
            this.particles_initial_distance_from_origin = this.global_radius * 0.99;
        }

        this.max_mass_particles = max_mass_particles;
        this.min_mass_particles = min_mass_particles;

        this.max_particle_density = 22.5; // Osmium density
        this.min_particle_density = 1; // Water density

        this.#scene = new Scene ({ background:0x040404 });
        this.#light = new AmbientLight (0xeb9b34, 3);

        this.#renderer = renderer || new Renderer ();
        container.append (this.#renderer.domElement);

        this.#camera = new PerspectiveCamera (35, window.innerWidth / window.innerHeight, 0.1, 200000);
        this.#camera.position.set (this.global_radius, this.global_radius, 0);
        this.#camera.lookAt (this.#scene.position);
        this.#controls = new OrbitControls (this.#camera, this.#renderer.domElement);

        this.#loop = new Loop (this.#camera, this.#scene, this.#renderer);

        this.#scene.add (this.#light, this.#camera);

        this.variables_info = new Map ();

        this.#particles = [];
        //this.addParticle (null, null, 20, 50000, 0x456672);
        this.addNParticles (number_of_particles);

        this.variables_info.set ("remaining_particles", this.#particles.length);

        this.events = setInterval (()=> 
        {
            let intersected_particle = null;
            let system_total_speed = 0;
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
                    force_experienced = this.#particles[i].getForceExperiencedFromExternalParticles (this.#particles, this.gravitational_constant);

                    this.#particles[i].force_experienced.x = force_experienced.x;
                    this.#particles[i].force_experienced.y = force_experienced.y;
                    this.#particles[i].force_experienced.z = force_experienced.z;

                    this.#particles[i].acceleration = { 
                        x: this.#particles[i].force_experienced.x / this.#particles[i].mass, 
                        y: this.#particles[i].force_experienced.y / this.#particles[i].mass,
                        z: this.#particles[i].force_experienced.z / this.#particles[i].mass 
                    };
                }

                system_total_speed += this.#particles[i].getInstantSpeed ();
            }

            this.variables_info.set ("remaining_particles", this.#particles.length);
            this.variables_info.set ("system_average_speed", (system_total_speed / this.#particles.length).toFixed (2));
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

            let r = getRandomNumber (this.particles_initial_distance_from_origin, this.global_radius, 0.001);
            let theta = getRandomNumber (0, 2 * Math.PI, 0.001);
            let phi = getRandomNumber (0, Math.PI, 0.001);

            let particle_position = getXYZFromSphericalCoords (r, theta, phi);

            let particle_velocity = {
                x: 0,
                y: 0, 
                z: 0
            };

            if (this.particles_initial_max_velocity_per_axis != 0)
            {
                particle_velocity = {
                    x: getRandomNumber (-this.particles_initial_max_velocity_per_axis, this.particles_initial_max_velocity_per_axis),
                    y: getRandomNumber (-this.particles_initial_max_velocity_per_axis, this.particles_initial_max_velocity_per_axis), 
                    z: getRandomNumber (-this.particles_initial_max_velocity_per_axis, this.particles_initial_max_velocity_per_axis)
                };
            }

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

    getRenderer () 
    {
        return this.#renderer;
    }

    start ()
    {
        this.#loop.start ();
    }

    stop ()
    {
        this.#loop.stop ();
    }

    saveCurrentProperties ()
    {


    }

    load (universe_properties)
    {
        console.log (universe_properties);
    }

    selfDestroy ()
    {
        this.stop ();
        clearInterval (this.events);

        this.#scene.traverse(object => {
            if (object.isMesh) {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (object.material.map) object.material.map.dispose();
                    object.material.dispose();
                }
            }
        });
        this.#renderer.dispose();
        
        // Remove all the object properties
        for (let prop in this) 
        {
            if (this.hasOwnProperty(prop)) 
            {
                delete this[prop];
            }
        }
    }

}

export { Universe }