import wellcome from '../../../assets/images/wellcome-img.png';

import './help.scss';

export const Help = () => {
    return (
        <div className="help">
            <div className="help__image">
                <img src={ wellcome } alt="" />

                <p>Versión 1.0.0</p>
            </div>

            <div className="help__info">
                <p>
                    Mini WhatsApp es un clon de whatsapp desarrollado con el fin de pulir habilidades
                    en el stack de teconologías MERN (MongoDB, Express, React y Node) usando Typescript.
                    Cualquier duda, sugerencia o inconveniente, por favor, enviar un correo a <i>kristhdev@gmail.com</i>
                </p>

                <p>
                    Si quieres ver el código fuente de este proyecto aquí te comparto el repositorio: 
                    {' '} <a href="https://github.com/KristhDev/MiniWhatsApp" target="_blank" rel="noreferrer">Repositorio</a>
                </p>
            </div>
        </div>
    );
}
