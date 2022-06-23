import HomeImg from '../../../assets/images/home-img.png';

import './welcome.scss';

export const Welcome = () => {
    return (
        <div className="welcome">
            <img loading="lazy" src={ HomeImg } alt="home-icon" />

            <h2 className="title-screen">Mantén tu télefono conectado</h2>

            <p>
                Mini WhatsApp es un pequeño clon de WhatsApp hecho en MERN basado en TypeScript. Se hizo con el fin
                de acostumbrarme a usar este lenguaje y mejorar mis habilidades como desarrollador.
            </p>
        </div>
    );
}