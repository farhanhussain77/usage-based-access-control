import bcrypt from 'bcrypt';

export const hashPassword = async (password: string, saltRounds = 12) => {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = bcrypt.hash(password, salt);

    return hashedPassword;

}


export const verifyPassword = async (password: string, hashedPassword: string) => {
    const isValid = await bcrypt.compare(password, hashedPassword);

    return isValid;
}