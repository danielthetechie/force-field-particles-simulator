import GUI from 'lil-gui';
import { normalize } from 'three/src/math/MathUtils';

/**
 * By default, step(1) -> 120 points, step (0.1) -> 12 points, etc.,
 * so when we want to call the method step(), we have to pass the 
 * step parameter normalized beforehand, i.e. 
 * step (normalizeMouseWheelStep (desired_step)).
 */
function normalizeMouseWheelStep (e, desired_step)
{
    let normalized_step = desired_step * (-e.deltaY / 120);
    if (normalized_step < 1) normalized_step = 1;
    
    return normalized_step;
}

class ControlPanel
{
    constructor (universe)
    {
        this.gui = new GUI ({ title: "Panel de control" });
        this.universe = universe;
        this.universe_settings = {
            gravitational_constant: this.universe.gravitational_constant,
            global_radius: this.universe.global_radius,
            particles_initial_distance_from_origin: this.universe.particles_initial_distance_from_origin,
            particles_initial_max_speed_per_axis: this.universe.particles_initial_max_speed_per_axis,
            number_of_particles: this.universe.getNumberOfParticles (), 
            max_mass_particles: this.universe.max_mass_particles,
            min_mass_particles: this.universe.min_mass_particles
        }

        this.setRangeProperty ('gravitational_constant', -10, 10, 1, "Constante de fuerza");
        this.global_radius_property = this.setRangeProperty ('global_radius', 10, 3000, 50, "Radio del universo");
        this.particles_inicial_distance_from_origin = this.setRangeProperty ('particles_initial_distance_from_origin', 0, 100, 1, "Distancia mínima al\ncentro del universo (%)");
        this.setRangeProperty ('particles_initial_max_speed_per_axis', 0, 20, 1, "Velocidad inicial aleatoria\nmáxima de las partículas");
        this.setRangeProperty ('number_of_particles', 1, 1000, 1, "Número inicial de partículas");
        this.max_mass_particles_property = this.setRangeProperty ('max_mass_particles', 1, 1000, 10, "Masa aleatoria máxima\nde las partículas");
        this.min_mass_particles_property = this.setRangeProperty ('min_mass_particles', 1, 100, 1, "Masa aleatoria mínima\nde las partículas (%)");

        this.dependentMinMaxProperties = new Map ();
        this.dependentMinMaxProperties.set (this.min_mass_particles_property, this.max_mass_particles_property);
        this.dependentMinMaxProperties.set (this.particles_inicial_distance_from_origin, this.global_radius_property);

        //this.setBooleanProperty ('enlarge_radius_after_bonding', "Aumentar tamaño de las\npartículas compuestas")
    }

    setBooleanProperty (property, name = null)
    {
        let added_property = this.gui.add (this.universe_settings, property).onFinishChange (new_value => 
        {
            this.universe_settings[property] = new_value;
            this.universe.restart (this.universe_settings);
        });

        if (name != null)
        {
            added_property.name (name);
        }
    }

    setRangeProperty (property, min, max, step, name = null)
    {
        let added_property = this.gui.add (this.universe_settings, property, min, max, step).onFinishChange (value_read => 
        {
            this.universe_settings[property] = value_read;
            this.updateDependentMinMaxProperties (value_read);
            this.universe.restart (this.universe_settings);
        });

        added_property.decimals (0);

        /*
        added_property.domElement.addEventListener("wheel", (e) => 
        {
            let tenth_of_max_value = Math.floor (max / 10);
            let wheel_step = normalizeMouseWheelStep (e, tenth_of_max_value);
            let current_value = this.universe_settings[property];
            console.log (current_value)
            //added_property.setValue (current_value + wheel_step);
        }, { passive: false });*/
        

        if (name != null)
        {
            added_property.name (name);
        }

        return added_property;
    }

    /**
     * To avoid having minimum values higher than their maximum counterparts.
     * For example, the max value of min_mass_particles will be equalized to 
     * the max_mass_particles current selected value.
     */ 
    updateDependentMinMaxProperties (value_read) 
    {
        let max_value = value_read;
        this.dependentMinMaxProperties.forEach ((max_property, min_property) => 
        {
            console.log (max_property, min_property);
            min_property.max (value_read);
        });
    }    
}

export { ControlPanel }