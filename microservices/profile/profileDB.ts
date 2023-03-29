import { ACCTYPE } from "../admin/iadmin";
import {
	IGetProfiles,
	IProfile,
	IProfileShort,
	IProfileShortForDialog,
} from "./iprofile";
import { getYearFromAge } from "../../utils/datetime";
import { conditionStr } from "../../utils/query";
import { poolDB } from "../../db/config";

const fieldProfile =
	"userid, timecode, name, location, " +
	"likes, favoriteusers, birthday, monthofbirth, yearofbirth, growth, weight, " +
	"gender, gendervapor, photomain, photolink, signzodiac, " +
	"education, fieldofactivity, maritalstatus, children, religion, " +
	"smoke, alcohol, discription, profit, interests, " +
	"ilikeCharacter, idontlikeCharacter, rating, stickerpacks, cash," +
	"acctype, filters, paid, deleteacc";

export async function getProfileByIdFromDB(userid: string): Promise<IProfile> {
	try {
		let queryStr = `SELECT ${fieldProfile} FROM users WHERE userid = '${userid}'`;
		const answerDB = await poolDB.query(queryStr);

		if (!answerDB.rows[0]) return undefined;

		return answerDB.rows[0];
	} catch (error) {
		console.log("getProfileByIdFromDB", error);
		return undefined;
	}
}

export const fieldProfileShort =
	"userid, timecode, name, birthday, monthofbirth, yearofbirth, gender, photomain, photolink, interests, rating";

export async function getProfilesShortFromDB(
	QueryGetProfiles: IGetProfiles
): Promise<IProfileShort[]> {
	const startPos = Number(QueryGetProfiles.startcount);
	const endPos = startPos + Number(QueryGetProfiles.amount);
	const { filters, users, userid } = QueryGetProfiles;

	try {
		let answerDB = { rows: [] };

		let queryStr = `SELECT ${fieldProfileShort} FROM users WHERE `;

		if (filters) {
			for (let key in filters)
				if (filters[key] === null) filters[key] = 0;

			const subAnswerDB = await poolDB.query(
				`SELECT gendervapor FROM users WHERE userid = '${userid}'`
			);
			const { gendervapor } = subAnswerDB.rows[0];

			queryStr += `(location = '${filters.location}') AND `;
			queryStr += `(yearofbirth >= ${getYearFromAge(
				filters.ageend
			)}) AND (yearofbirth <= ${getYearFromAge(filters.agestart)}) AND `;
			queryStr += `(growth >= ${filters.growthstart}) AND (growth <= ${filters.growthend}) AND `;
			queryStr += conditionStr("weight", filters.weight);
			queryStr += conditionStr("signzodiac", filters.signzodiac);

			if (filters.gendervapor !== 2) {
				if (gendervapor === 0) {
					queryStr += `(gendervapor = '${1}') AND `;
				} else if (gendervapor === 1) {
					queryStr += `(gendervapor = '${0}') AND `;
				}

				if (filters.gendervapor === 0) {
					queryStr += `(gender = '${0}') AND `;
				} else if (filters.gendervapor === 1) {
					queryStr += `(gender = '${1}') AND `;
				}
			} else {
				queryStr += `(gendervapor = '${2}') AND `;
			}

			queryStr += conditionStr("education", filters.education);
			queryStr += conditionStr(
				"fieldofactivity",
				filters.fieldofactivity
			);
			queryStr += conditionStr("maritalstatus", filters.maritalstatus);
			queryStr += conditionStr("children", filters.children);
			queryStr += conditionStr("religion", filters.religion);
			queryStr += conditionStr("smoke", filters.smoke);
			queryStr += conditionStr("alcohol", filters.alcohol);
			queryStr += conditionStr("profit", filters.profit);
			queryStr += `(userid <> '${QueryGetProfiles.userid}') AND `;
			queryStr += `(acctype = '${ACCTYPE.user}')`;

			answerDB = await poolDB.query(queryStr);
		} else if (users) {
			if (users.length === 0) {
				return [];
			} else {
				users.forEach((value) => {
					queryStr += `(userid = '${value}' :: TEXT) OR `;
				});
			}

			queryStr = queryStr.slice(0, -3);

			answerDB = await poolDB.query(queryStr);
		}

		let profiles: IProfile[] = answerDB.rows;

		if (profiles.length > 1) {
			let newProfiles = profiles.sort((a, b) => b.rating - a.rating);

			if (startPos - endPos) {
				newProfiles = newProfiles.slice(startPos, endPos);
			}

			profiles = newProfiles;
		}

		return profiles;
	} catch (error) {
		console.log("getProfilesShortFromDB", error);
		return [];
	}
}

export async function getProfilesShortForLikesFromDB(
	QueryGetProfiles: IGetProfiles
): Promise<IProfile[]> {
	const startPos = Number(QueryGetProfiles.startcount);
	const endPos = startPos + Number(QueryGetProfiles.amount);

	try {
		let answerDB: { rows: IProfile[] } = { rows: [] };

		let queryStr = `SELECT likes FROM users WHERE userid = '${QueryGetProfiles.userid}'`;

		answerDB = await poolDB.query(queryStr);

		if (answerDB.rows.length === 0) {
			return [];
		}

		const { likes } = answerDB.rows[0];

		queryStr = `SELECT ${fieldProfileShort} FROM users WHERE `;

		if (likes.length === 0) {
			return [];
		} else {
			likes.forEach((value) => {
				queryStr += `(userid = '${value}' :: TEXT) OR `;
			});
		}

		queryStr = queryStr.slice(0, -3);

		answerDB = await poolDB.query(queryStr);

		let profiles = answerDB.rows;

		if (profiles.length > 1) {
			let newProfiles = profiles.sort((a, b) => b.rating - a.rating);

			if (startPos - endPos) {
				newProfiles = newProfiles.slice(startPos, endPos);
			}

			profiles = newProfiles;
		}

		return profiles;
	} catch (error) {
		console.log("getProfilesShortForLikesFromDB", error);
		return [];
	}
}

export async function getProfilesForDialogsFromDB(
	users: Array<string>
): Promise<IProfileShortForDialog[]> {
	try {
		let answerDB: { rows: IProfileShortForDialog[] } = { rows: [] };

		let queryStr =
			"SELECT userid, name, birthday, monthofbirth, yearofbirth, photomain, photolink FROM users WHERE ";

		if (users) {
			if (users.length === 0) {
				return [];
			} else {
				users.forEach((value) => {
					queryStr += `(userid = '${value}' :: TEXT) OR `;
				});
			}

			queryStr = queryStr.slice(0, -3);

			answerDB = await poolDB.query(queryStr);
		}

		return answerDB.rows;
	} catch (error) {
		console.log("getProfilesForDialogsFromDB", error);
		return [];
	}
}

export async function setProfileByIdToDB(
	ourId: string,
	profile: IProfile
): Promise<IProfile> {
	try {
		let queryStrProfile = "UPDATE users SET ";

		queryStrProfile += `name = '${profile.name}', `;
		queryStrProfile += `location = '${profile.location}', `;
		queryStrProfile += `birthday = '${profile.birthday}', `;
		queryStrProfile += `monthofbirth = '${profile.monthofbirth}', `;
		queryStrProfile += `yearofbirth = '${profile.yearofbirth}', `;
		queryStrProfile += `growth = '${profile.growth}', `;
		queryStrProfile += `weight = '${profile.weight}', `;
		queryStrProfile += `gender = '${profile.gender}', `;
		queryStrProfile += `gendervapor = '${profile.gendervapor}', `;
		queryStrProfile += `signzodiac = '${profile.signzodiac}', `;
		queryStrProfile += `education = '${profile.education}', `;
		queryStrProfile += `fieldofactivity = '${profile.fieldofactivity}', `;
		queryStrProfile += `maritalstatus = '${profile.maritalstatus}', `;
		queryStrProfile += `children = '${profile.children}', `;
		queryStrProfile += `religion = '${profile.religion}', `;
		queryStrProfile += `smoke = '${profile.smoke}', `;
		queryStrProfile += `alcohol = '${profile.alcohol}', `;
		queryStrProfile += `discription = '${profile.discription}', `;
		queryStrProfile += `profit = '${profile.profit}', `;
		queryStrProfile += `interests = $1, `;
		queryStrProfile += `filters = $2, `;
		queryStrProfile += `ilikecharacter = $3, `;
		queryStrProfile += `idontlikecharacter = $4 `;
		queryStrProfile += `WHERE userid = '${ourId}'`;

		const answerDBProfile = await poolDB.query(queryStrProfile, [
			profile.interests,
			profile.filters,
			profile.ilikecharacter,
			profile.idontlikecharacter,
		]);
	} catch (error) {
		console.log("setProfileByIdToDB", error);
		return undefined;
	}

	try {
		const newProfile = await getProfileByIdFromDB(ourId);
		return newProfile;
	} catch (error) {
		console.log("setProfileByIdToDB get:", error);
		return undefined;
	}
}

export async function getProfileCashByIdFromDB(
	userid: string
): Promise<number> {
	try {
		let queryStr = `SELECT cash FROM users WHERE userid = '${userid}'`;
		const answerDB = await poolDB.query(queryStr);

		const { cash } = answerDB.rows[0];

		return cash;
	} catch (error) {
		console.log("getProfileCashByIdFromDB", error);
		return 0;
	}
}

export async function setProfileCashByIdToDB(
	userid: string,
	cash: number
): Promise<number> {
	try {
		let queryStr = `UPDATE users SET cash = ${cash} WHERE userid = '${userid}'`;
		const answerDB = await poolDB.query(queryStr);

		return answerDB.rowCount;
	} catch (error) {
		console.log("setProfileCashByIdToDB", error);
		return 0;
	}
}

export async function getProfileRatingByIdFromDB(
	userid: string
): Promise<number> {
	try {
		let queryStr = `SELECT rating FROM users WHERE userid = '${userid}'`;
		const answerDB = await poolDB.query(queryStr);

		const { rating } = answerDB.rows[0];

		return rating;
	} catch (error) {
		console.log("getProfileRatingByIdFromDB", error);
		return 0;
	}
}

export async function setProfileRatingByIdToDB(
	userid: string,
	rating: number
): Promise<number> {
	try {
		let queryStr = `UPDATE users SET rating = ${rating} WHERE userid = '${userid}'`;
		const answerDB = await poolDB.query(queryStr);

		return answerDB.rowCount;
	} catch (error) {
		console.log("setProfileRatingByIdToDB", error);
		return 0;
	}
}

export async function getProfileStickerpacksByIdFromDB(
	userid: string
): Promise<string[]> {
	try {
		let queryStr = `SELECT stickerpacks FROM users WHERE userid = '${userid}'`;
		const answerDB = await poolDB.query(queryStr);

		const { stickerpacks } = answerDB.rows[0];

		return stickerpacks;
	} catch (error) {
		console.log("getProfileStickerpacksByIdFromDB", error);
		return [];
	}
}

export async function setProfileStickerpacksByIdToDB(
	userid: string,
	stickerpacks: string[]
): Promise<number> {
	try {
		let queryStr = `UPDATE users SET stickerpacks = $1 WHERE userid = '${userid}'`;
		const answerDB = await poolDB.query(queryStr, [stickerpacks]);

		return answerDB.rowCount;
	} catch (error) {
		console.log("setProfileStickerpacksByIdToDB", error);
		return 0;
	}
}
