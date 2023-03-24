import {
	IGetProfiles,
	IProfile,
	IQueryGetProfile,
	IQueryGetProfiles,
} from "./iprofile";
import { getSignZodiac } from "../../utils/signzodiac";
import { testToken } from "../auth/token";
import { getProfileByIdFromDB, setProfileByIdToDB } from "./profileDB";
import { isBannedUser } from "../../utils/banned";
import { getProfilesShort, getProfilesShortForLikes } from "./profileUtils";
import {
	answerStatus400,
	answerStatusFailJWT,
	answerStatusQTDB,
} from "../../utils/answerstatus";

export async function querySetProfile(req, res) {
	try {
		let { jwt } = req.cookies;
		jwt = String(jwt);

		const jwtDecode = await testToken(jwt);

		if (!jwtDecode) return answerStatusFailJWT(res);

		const { profile } = req.body;
		profile as IProfile;

		profile.signzodiac = getSignZodiac(
			profile.birthday,
			profile.monthofbirth
		);

		const newProfile = await setProfileByIdToDB(jwtDecode.userId, profile);

		if (!newProfile) return answerStatus400(res, "Ошибка QTDB!");

		return res.status(200).json(newProfile);
	} catch (error) {
		return answerStatusQTDB(res, error);
	}
}

export async function queryGetProfile(req, res) {
	try {
		let { jwt } = req.cookies;
		jwt = String(jwt);

		const jwtDecode = await testToken(jwt);

		if (!jwtDecode) return answerStatusFailJWT(res);

		const isBanned = await isBannedUser(jwtDecode.userId);

		if (isBanned) return answerStatusFailJWT(res);

		const QueryGetProfile: IQueryGetProfile = req.query;
		const userid = String(QueryGetProfile.userid);

		let userIdNew = userid;

		if (userIdNew === "0") {
			userIdNew = jwtDecode.userId;
		}

		const profile = await getProfileByIdFromDB(userIdNew);

		if (!profile) return answerStatus400(res, "Ошибка QTDB!");

		if (userid !== "0") {
			const posId = profile.likes.indexOf(jwtDecode.userId);

			if (posId === -1) {
				profile.likes = [];
			} else {
				profile.likes = [jwtDecode.userId];
			}

			profile.cash = 0;
			profile.favoriteusers = [];
			profile.paid = undefined;
		}

		return res.status(200).json(profile);
	} catch (error) {
		return answerStatusQTDB(res, error);
	}
}

export async function queryGetProfilesShort(req, res) {
	try {
		let { jwt } = req.cookies;
		jwt = String(jwt);

		const jwtDecode = await testToken(jwt);

		if (!jwtDecode) return answerStatusFailJWT(res);

		const QueryGetProfiles: IQueryGetProfiles = req.query;

		const getProfilesVal: IGetProfiles = {
			userid: QueryGetProfiles.userid,
			startcount: QueryGetProfiles.startcount,
			amount: QueryGetProfiles.amount,
			filters: QueryGetProfiles.filters,
			users: [],
		};

		const { filters, users } = QueryGetProfiles;

		if (filters) {
			const filtersParse = JSON.parse(filters as any);
			getProfilesVal.filters = filtersParse;
		}

		if (users) {
			const usersParse = JSON.parse(users);
			getProfilesVal.users = usersParse;
		}

		getProfilesVal.userid = jwtDecode.userId;

		const profiles = await getProfilesShort(getProfilesVal);

		return res.status(200).json(profiles);
	} catch (error) {
		return answerStatusQTDB(res, error);
	}
}

export async function queryGetProfilesForLikes(req, res) {
	try {
		let { jwt } = req.cookies;
		jwt = String(jwt);

		const jwtDecode = await testToken(jwt);

		if (!jwtDecode) return answerStatusFailJWT(res);

		const QueryGetProfiles: IQueryGetProfiles = req.query;

		const getProfilesVal: IGetProfiles = {
			userid: QueryGetProfiles.userid,
			startcount: QueryGetProfiles.startcount,
			amount: QueryGetProfiles.amount,
			filters: QueryGetProfiles.filters,
			users: [],
		};

		getProfilesVal.userid = jwtDecode.userId;

		const profiles = await getProfilesShortForLikes(getProfilesVal);

		return res.status(200).json(profiles);
	} catch (error) {
		return answerStatusQTDB(res, error);
	}
}