import { Formik } from 'formik';
import { If } from '@anissoft/react-conditions';
import { object, string } from 'yup';

import { useAuth } from '../../../hooks';

import { ProfileForm } from '../ProfileForm';

import './profile.scss';

export const Profile = () => {
    const { user } = useAuth();

    const profileFormSchema = object().shape({
        username: string()
            .required('Username is requerido')
            .max(25, 'Username no puede tener más de 25 caracteres'),
    });

    return (
        <div className="profile-form">
            <If condition={ !!user?.id }>
                <Formik
                    initialValues={{ 
                        username: user?.username || '',
                        description: user?.description || ''
                    }}
                    validationSchema={ profileFormSchema }
                    onSubmit={ () => {} }
                >
                    { ({ values, isValid }) => (
                        <ProfileForm 
                            values={ values } 
                            isValid={ isValid } 
                        />
                    ) }
                </Formik>
            </If>
        </div>
    );
}