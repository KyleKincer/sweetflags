import User from '../models/UserModel';
import App from '../models/AppModel';
import { IUser, IUserInputDTO } from '../interfaces/IUser';
import { isIUser, isIUserArray, isIUserInputDTO } from '../type-guards/IUser';

class UserService {
    async getAllUsers(): Promise<IUser[]> {
        const userDocs = await User.find().populate('app').exec();
        if (!userDocs) {
            throw new Error('No users found');
        }

        const users = userDocs.map(user => {
            user = user.toObject();
            return user;
        });

        if (!isIUserArray(userDocs)) {
            throw new Error('Invalid user data');
        }

        return users;
    }

    async getUserById(id: string): Promise<IUser> {
        const userDoc = await User.findById(id).populate('app').exec();
        if (!userDoc) {
            throw new Error('User not found');
        }

        const user = userDoc.toObject();
        if (!isIUser(user)) {
            throw new Error('Invalid user data');
        }

        return user;
    }

    async getUsersByAppId(appId: string): Promise<IUser[]> {
        const app = await App.findById(appId);
        if (!app) {
            throw new Error('App not found');
        }

        const userDocs = await User.find({ app: appId }).populate('app').exec();
        if (!userDocs) {
            throw new Error('No users found');
        }

        const users = userDocs.map(user => {
            user = user.toObject();
            return user;
        });

        if (!isIUserArray(users)) {
            throw new Error('Invalid user data');
        }

        return users;
    }

    async getUserByAppIdAndExternalId(appId: string, externalId: string): Promise<IUser> {
        const appDoc = await App.findById(appId);
        if (!appDoc) {
            throw new Error('App not found');
        }

        const userDoc = await User.findOne({ app: appId, externalId: externalId }).populate('app').exec();
        if (!userDoc) {
            throw new Error('User not found');
        }

        const user = userDoc.toObject();
        if (!isIUser(user)) {
            throw new Error('Invalid user data');
        }

        return user;
    }

    async createUser(user: IUserInputDTO): Promise<IUser> {
        if (!isIUserInputDTO(user)) {
            throw new Error('Invalid user data');
        }

        const userDoc = await User.create(user);
        if (!userDoc) {
            throw new Error('User not created');
        }

        await userDoc.populate('app');

        const createdUser = userDoc.toObject();
        if (!isIUser(createdUser)) {
            throw new Error('Invalid user data');
        }

        return createdUser;
    }

    async updateUser(id: string, user: IUserInputDTO): Promise<IUser> {
        if (!isIUserInputDTO(user)) {
            throw new Error('Invalid user data');
        }

        const userDoc = await User.findByIdAndUpdate(id, user, { new: true }).populate('app').exec();
        if (!userDoc) {
            throw new Error('User not updated');
        }

        const updatedUser = userDoc.toObject();
        if (!isIUser(updatedUser)) {
            throw new Error('Invalid user data');
        }

        return updatedUser;
    }

    async deleteUser(id: string): Promise<IUser> {
        const userDoc = await User.findByIdAndDelete(id).exec();
        if (!userDoc) {
            throw new Error('User not deleted');
        }

        await userDoc.populate('app');
        const deletedUser = userDoc.toObject();
        if (!isIUser(deletedUser)) {
            throw new Error('Invalid user data');
        }
        return deletedUser;
    }
}

export default new UserService();