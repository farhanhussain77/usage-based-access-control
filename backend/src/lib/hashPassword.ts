import bcrypt from 'bcrypt';

export const hashPassword = async (password: string, saltRounds = 12) => {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = bcrypt.hash(password, salt);

    return hashedPassword;

}