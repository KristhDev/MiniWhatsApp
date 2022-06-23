import { Models } from '../interfaces/models';

import { ContactDocument } from '../interfaces/contact';
import { UserDocument } from '../interfaces/user';

const global: Models = {
    user: {} as UserDocument,
    contact: {} as ContactDocument
}

export default global;