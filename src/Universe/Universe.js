import { Scene, PerspectiveCamera, Vector3, MeshBasicMaterial, Color } from 'three';
import { Loop } from './systems/Loop.js';
import { Renderer } from './systems/Renderer.js';
import { Resizer } from './systems/Resizer.js';
import { Particle } from './components/Particle.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { getRandomNumber, getXYZFromSphericalCoords, getLengthOfN3DVectorsSum } from './helpers/math.js';
import { removeObjectFromArray, removeMeshFromScene } from './helpers/generic_functions.js';

class Universe 
{
    //#light;
    #scene;
    #camera;
    #renderer;
    #loop;
    #particles;
    #controls;

    constructor ({container, renderer = null, gravitational_constant = -1, global_radius = 200, particles_initial_distance_from_origin = 0, particles_initial_max_speed_per_axis = 0, number_of_particles = 100, max_mass_particles = 10, min_mass_particles = 3, enlarge_radius_after_bonding = true })
    {
		this.particles_material = new MeshBasicMaterial ();
        this.gravitational_constant = gravitational_constant;
        this.global_radius = global_radius;
        this.particles_initial_distance_from_origin = particles_initial_distance_from_origin;
        this.particles_initial_max_speed_per_axis = particles_initial_max_speed_per_axis;

        if (this.particles_initial_distance_from_origin >= this.global_radius)
        {
            this.particles_initial_distance_from_origin = this.global_radius * 0.99;
        }

        this.max_mass_particles = max_mass_particles;
        this.min_mass_particles = min_mass_particles;

        this.max_particle_density = 22.5; // Osmium density
        this.min_particle_density = 1; // Water density

        this.enlarge_radius_after_bonding = enlarge_radius_after_bonding;

        this.#scene = new Scene ({ background:0x040404 });
        //this.#light = new AmbientLight (0xeb9b34, 3);

        this.#renderer = renderer || new Renderer ();
        container.append (this.#renderer.domElement);

        this.#camera = new PerspectiveCamera (35, window.innerWidth / window.innerHeight, 0.1, 200000);
        this.#camera.position.set (this.global_radius, this.global_radius, 0);
        this.#camera.lookAt (this.#scene.position);
        this.#controls = new OrbitControls (this.#camera, this.#renderer.domElement);

        this.#loop = new Loop (this.#camera, this.#scene, this.#renderer);

        this.#scene.add (this.#camera);

        this.variables_info = new Map ();

        this.#particles = [];
        this.addNParticles (number_of_particles);

        this.variables_info.set ("remaining_particles", this.#particles.length);

        this.#loop.updatables.push (this);

        new Resizer (container, this.#camera, this.#renderer).setSize ();
    }

    addParticle (position, velocity, radius, mass, color)
    {
        let particle = new Particle (this.particles_material, position, velocity, radius, mass);
		
		particle.mesh.material.color = new Color (color);

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

            if (this.particles_initial_max_speed_per_axis != 0)
            {
                particle_velocity = {
                    x: getRandomNumber (-this.particles_initial_max_speed_per_axis, this.particles_initial_max_speed_per_axis),
                    y: getRandomNumber (-this.particles_initial_max_speed_per_axis, this.particles_initial_max_speed_per_axis), 
                    z: getRandomNumber (-this.particles_initial_max_speed_per_axis, this.particles_initial_max_speed_per_axis)
                };
            }

            this.addParticle (particle_position, particle_velocity, particle_radius, particle_mass);

        }
    }

    destroyParticle (particle)
    {
        const particle_index = this.#particles.indexOf (particle);
        const particle_mesh = this.#particles[particle_index].mesh;
        this.#scene = removeMeshFromScene (particle_mesh, this.#scene);

        this.#particles = removeObjectFromArray (particle, this.#particles);
        this.#loop.updatables = removeObjectFromArray (particle, this.#loop.updatables);
    }

    destroyAllParticles ()
    {
        for (let i = this.#particles.length - 1; i >= 0; i--) 
        {
            this.destroyParticle(this.#particles[i]);
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
        
        let paired_particle_radius = Math.cbrt ((particle_1.radius ** 3) + (particle_2.radius **3));

        // Since we have created a new paired particle, we can remove its primary components.
        this.destroyParticle (particle_1);
        this.destroyParticle (particle_2);

        this.addParticle (paired_particle_position, paired_particle_velocity, paired_particle_radius, paired_particle_mass, color_after_collision);

    }

    getRenderer () 
    {
        return this.#renderer;
    }

    getNumberOfParticles ()
    {
        return this.#particles.length;
    }

    start ()
    {
        this.#loop.start ();
    }

    stop ()
    {
        this.#loop.stop ();
    }

    updateProperties ({container, renderer, gravitational_constant, global_radius, particles_initial_distance_from_origin, particles_initial_max_speed_per_axis, number_of_particles, max_mass_particles, min_mass_particles} = {})
    {
        if (container != null) this.container = container;
        if (renderer != null) this.renderer = renderer;
        if (gravitational_constant != null) this.gravitational_constant = gravitational_constant;
        if (global_radius != null) this.global_radius = global_radius;
        if (particles_initial_distance_from_origin != null) this.particles_initial_distance_from_origin = particles_initial_distance_from_origin;
        if (particles_initial_max_speed_per_axis != null) this.particles_initial_max_speed_per_axis = particles_initial_max_speed_per_axis;
        if (number_of_particles != null) this.number_of_particles = number_of_particles;
        if (max_mass_particles != null) this.max_mass_particles = max_mass_particles;
        if (min_mass_particles != null) this.min_mass_particles = min_mass_particles;

        this.destroyAllParticles ();
        this.addNParticles (this.number_of_particles);
    }

    tick (delta = null)
    {
        let intersected_particle = null;
        let system_average_speed = 0;
        for (let i = 0; i < this.#particles.length; i++)
        {
            intersected_particle = this.#particles[i].getFirstIntersectingExternalParticle (this.#particles);

            if (intersected_particle != null)
            {
                // Collision happened
                this.bondPairedParticlesAfterInelasticCollision (this.#particles[i], intersected_particle);
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

            /**
             * Sometimes, when the particles get bonded together (and thus, their original
             * references are removed), we can't calculate the average system speed based
             * on them, so we just wait till the next frame to attempt the calculation again.
             */

            try {
                system_average_speed += this.#particles[i].getInstantSpeed ();
            } catch {
                // Just wait till the next frame.
            }
        }

        this.variables_info.set ("remaining_particles", this.#particles.length);
        this.variables_info.set ("system_average_speed", (system_average_speed / this.#particles.length).toFixed (2));
    }

    restart (properties)
    {
        this.stop ();
        this.updateProperties (properties);
        this.start ();
    }

    selfDestroy ()
    {
        this.stop ();

        this.#scene.traverse (object => 
        {
            if (object.isMesh) 
            {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (object.material.map) object.material.map.dispose();
                    object.material.dispose();
                }
            }
        });
        this.#renderer.dispose();
        
        // Remove all the universe properties
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
