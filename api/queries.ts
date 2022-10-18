import { IDialog, IGetProfiles, IProfile, IQueryGetProfiles } from "../interfaces/iprofiles";
const Pool = require('pg').Pool;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'miss-you',
    password: '123456789',
    port: 5432,
})


export async function getIdByEmailFromDB(email: string) {
    try {
        const answerDB = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        return answerDB.rows[0].id;
    } catch (error) {
        console.log(error);
    }
   
    return -1;
}

export async function getPasswordByIdFromDB(id: number) {
    try {
        const answerDB = await pool.query('SELECT password FROM users WHERE id = $1', [id]);

        return answerDB.rows[0].password;
    } catch (error) {
        console.log(error);
    }
   
    return '';
}

const fieldProfile = 'id, timecode, name, latitude, longitude, location, ' +
'likes, age, birthday, monthofbirth, yearofbirth, growth, weight, ' +
'gender, gendervapor, photomain, photolink, signzodiac, ' +
'education, fieldofactivity, maritalstatus, children, religion, ' +
'smoke, alcohol, discription, profit, interests, ' +
'ilikeCharacter, idontlikeCharacter';

const fieldFilters = 'location, signzodiac, agestart, ageend, ' +
'growthstart, growthend, weightstart, weightend, gendervapor, ' +
'religion, smoke, alcohol, interests'
;

export async function getProfileByIdFromDB(id: number) {
    try {
        let queryStr = 'SELECT ' + fieldProfile + ' FROM users WHERE id = $1';
        const answerDB = await pool.query(queryStr, [id]);

        if (!answerDB.rows[0]) return {}

        let queryStrFilters = 'SELECT ' + fieldFilters + ' FROM filters WHERE id = $1';
        const answerDBFilters = await pool.query(queryStrFilters, [id]);

        if (!answerDBFilters.rows[0]) return {}

        answerDB.rows[0].filters = answerDBFilters.rows[0];

        return answerDB.rows[0];
    } catch (error) {
        console.log('getProfileByIdFromDB', error);
    }

    return {};
}

const fieldProfileShort = 'id, timecode, name, age, gender, photomain, photolink, interests';

export async function getProfiles(QueryGetProfiles: IGetProfiles) {
    let countProfiles = 0;
    const startPos = Number(QueryGetProfiles.startcount);
    const endPos = startPos + Number(QueryGetProfiles.amount);
    const { filters, users } = QueryGetProfiles;

    try {
        let answerDB = { rows: [] };

        let queryStr = 'SELECT ' + fieldProfileShort + ' FROM users WHERE ';

        if (filters) {
            queryStr += '(location = $1) AND ';

            if (filters.signzodiac === 12) {
                queryStr += '(signzodiac <> $2) AND ';
            } else {
                queryStr += '(signzodiac = $2) AND ';
            }

            queryStr += '(age >= $3) AND (age <= $4) AND ';
            queryStr += '(growth >= $5) AND (growth <= $6) AND ';
            queryStr += '(weight >= $7) AND (weight <= $8) AND ';

            queryStr += '(gendervapor = $9) AND ';

            if (filters.religion === 0) {
                queryStr += '((religion <> $10) OR (religion = 0)) AND ';
            } else {
                queryStr += '(religion = $10) AND ';
            }

            if (filters.smoke === 0) {
                queryStr += '((smoke <> $11) OR (smoke = 0)) AND ';
            } else {
                queryStr += '(smoke = $11) AND ';
            }

            if (filters.alcohol === 0) {
                queryStr += '((alcohol <> $12) OR (alcohol = 0)) AND ';
            } else {
                queryStr += '(alcohol = $12) AND ';
            }

            queryStr += '(id <> $13)';

            let gendervapor = filters.gendervapor;

            if (filters.gendervapor === 0) {
                gendervapor = 1;
            } else if (filters.gendervapor === 1) {
                gendervapor = 0;
            }
            
            answerDB = await pool.query(queryStr, [
                filters.location, 
                filters.signzodiac,
                filters.agestart, filters.ageend,
                filters.growthstart, filters.growthend,
                filters.weightstart, filters.weightend,
                gendervapor,
                filters.religion,
                filters.smoke,
                filters.alcohol,
                QueryGetProfiles.id
            ]);
        } else if (users) {
            if (users.length === 0) {
                return [];
            } else {
                users.forEach((value) => {
                    queryStr += '(id = ' + value + ') OR ';
                })
            }

            queryStr = queryStr.slice(0, -3);
            answerDB = await pool.query(queryStr);
        }

        return answerDB.rows;
    } catch (error) {
        console.log('getProfiles', error);
    }

    return [];
}

export async function setProfileByIdToDB(id: number, profile: IProfile) {
    try {
        let queryStrProfile = 'UPDATE users SET ';
        
        queryStrProfile += 'name = $2, location = $3, age = $4, ';
        queryStrProfile += 'birthday = $5, monthofbirth = $6, yearofbirth = $7, ';
        queryStrProfile += 'growth = $8, weight = $9, ';
        queryStrProfile += 'gender = $10, gendervapor = $11, ';
        queryStrProfile += 'signzodiac = $12, education = $13, ';
        queryStrProfile += 'fieldofactivity = $14, maritalstatus = $15, ';
        queryStrProfile += 'children = $16, religion = $17, ';
        queryStrProfile += 'smoke = $18, alcohol = $19, ';
        queryStrProfile += 'discription = $20, profit = $21, ';
        queryStrProfile += 'interests = $22, ';
        queryStrProfile += 'ilikecharacter = $23, idontlikecharacter = $24 ';
        queryStrProfile += 'WHERE id = $1';

        const answerDBProfile = await pool.query(queryStrProfile, [id,
            profile.name, profile.location, profile.age,
            profile.birthday, profile.monthofbirth, profile.yearofbirth,  
            profile.growth, profile.weight,
            profile.gender, profile.gendervapor,
            profile.signzodiac, profile.education,
            profile.fieldofactivity, profile.maritalstatus,
            profile.children, profile.religion,
            profile.smoke, profile.alcohol,
            profile.discription, profile.profit,
            profile.interests,
            profile.ilikecharacter, profile.idontlikecharacter,         
        ]);

        let queryStrFilters = 'UPDATE filters SET ';

        queryStrFilters += 'location = $2, ';
        queryStrFilters += 'agestart = $3, ageend = $4, ';
        queryStrFilters += 'growthstart = $5, growthend = $6, ';
        queryStrFilters += 'weightstart = $7, weightend = $8, ';
        queryStrFilters += 'signzodiac = $9, ';
        queryStrFilters += 'gendervapor = $10, ';
        queryStrFilters += 'religion = $11, ';
        queryStrFilters += 'smoke = $12, ';
        queryStrFilters += 'alcohol = $13, ';
        queryStrFilters += 'interests = $14 ';
        queryStrFilters += 'WHERE id = $1';

        const answerDBFilters = await pool.query(queryStrFilters, [id, 
            profile.filters.location, 
            profile.filters.agestart, profile.filters.ageend,
            profile.filters.growthstart, profile.filters.growthend,
            profile.filters.weightstart, profile.filters.weightend,
            profile.filters.signzodiac, 
            profile.filters.gendervapor,
            profile.filters.religion,
            profile.filters.smoke,
            profile.filters.alcohol,
            profile.filters.interests,
        ]);
    } catch (error) {
        console.log('setProfileByIdToDB:', error);
    }

    let newProfile = {};

    try {
        newProfile = await getProfileByIdFromDB(id);
    } catch (error) {
        console.log('setProfileByIdToDB get:', error);
        
    }

    return newProfile;
}

export function setProfileShort(profile: IProfile) {
    // for (let i = 0; i < userList.length; i++) {
    //     if (userList[i].id === profile.id) {

    //         return true;
    //     }
    // }

    return false;
}


export async function setJWTToDB(id: number, jwt: string) { // Set JWT in DB
    try {
        const answerDB = await pool.query("UPDATE users SET jwt = $1 WHERE id = $2", [jwt, id]);

        return answerDB.rowCount;
    } catch (error) {
        console.log('setProfileByIdToDB:', error);
    }
   
    return 0;
}

export async function setTimecodeToDB(id: number) { // Set Time code in DB
    const date = new Date();
    const timecode = date.getTime();

    try {
        const answerDB = await pool.query("UPDATE users SET timecode = $2 WHERE id = $1", [id, timecode]);

        return answerDB.rowCount;
    } catch (error) {
        console.log('setTimecodeToDB:', error);
    }
   
    return timecode;
}

export async function getJWTFromDB(id: number) { // Get JWT in DB
    try {
        const answerDB = await pool.query('SELECT jwt FROM users WHERE id = $1', [id]);

        return answerDB.rows[0].jwt;
    } catch (error) {
        console.log('getJWTFromDB:', error);
    }
   
    return '';
}

export function createProfile(profile: IProfile) { // Create base Profile in DB
    // let id = 0;

    // for (let i = 0; i < userList.length; i++) {
    //     id = Math.max(id, userList[i].id);
    // }

    // profile.id = id + 1;

    // userList.push(profile);

    return true;
}

export async function getLikesByIdFromDB(id: number) {
    try {
        let queryStr = 'SELECT likes FROM users WHERE id = $1';
        const answerDB = await pool.query(queryStr, [id]);

        return answerDB.rows[0].likes;
    } catch (error) {
        console.log('getProfileByIdFromDB', error);
    }

    return {};
}

export async function setLikesByIdFromDB(id: number, arr: [number]) {
    try {
        let queryStr = 'UPDATE users SET likes = $1 WHERE id = $2';
        
        const answerDB = await pool.query(queryStr, [arr, id]);

        return answerDB.rowCount;
    } catch (error) {
        console.log('setLikesByIdFromDB', error);
    }

    return 0;
}

export async function getDialogByIdFromDB(id1: number, id2: number, idDialog: number = 0) {
    try {
        let answerDB = { rows: [] };

        let queryStr = 'SELECT id, id1, id2, timecode, dck, messages FROM messages WHERE ';

        if (idDialog) {
            queryStr += 'id = $1';

            answerDB = await pool.query(queryStr, [idDialog]);
        } else {
            queryStr += '(id1 = $1 AND id2 = $2) OR (id1 = $2 AND id2 = $1)';

            answerDB = await pool.query(queryStr, [id1, id2]);
        }

        return answerDB.rows[0];
    } catch (error) {
        console.log('getDialogByIdFromDB', error);
    }

    return [];
}

export async function setDialogByIdToDB(idDialog: number, dialog: IDialog) {
    const date = new Date();
    const timecode = date.getTime();

    let answerDB = { rows: [] };

    try {
        if (dialog.messages.length === 1) {
            const queryStr = 'INSERT INTO messages (id1, id2, timecode, dck, messages) VALUES ($1, $2, $3, $4, ARRAY [$5])';

            answerDB = await pool.query(queryStr, [dialog.id1, dialog.id2, timecode, dialog.dck, dialog.messages]);

            return answerDB.rows[0];
        } else {
            const queryStr = 'UPDATE users SET timecode = $2, messages = $3 WHERE id = $1';

            answerDB = await pool.query(queryStr, [idDialog, timecode, dialog.messages]);

            return answerDB.rows[0];
        }
    } catch (error) {
        console.log('setDialogByIdToDB', error);
    }

    return []
}

export async function getDialogsByIdFromDB(idUser: number) {
    try {
        let answerDB = { rows: [] };

        let queryStr = 'SELECT id, id1, id2, messages FROM messages WHERE id1 = $1 OR id2 = $1';
        
        answerDB = await pool.query(queryStr, idUser);

        return answerDB.rows[0];
    } catch (error) {
        console.log('getDialogsByIdFromDB', error);
    }

    return [];
}
