import { IComplaintOutput } from "../interfaces/icomplaints";
import { getComplaintsByIdFromDB } from "../query/complaints";
import { getProfilesForDialogs } from "../query/profile";

export const getComplaints = async (
	ourId: string
): Promise<IComplaintOutput[]> => {
	try {
		const complaints = await getComplaintsByIdFromDB(ourId);

		if (!complaints.length) return [];

		const idUsers = complaints.map((dialog) => dialog.userto);

		const users = await getProfilesForDialogs(idUsers);

		complaints.sort((a, b) => {
			const id1 = a.userto;
			const id2 = b.userto;

			if (id1 > id2) {
				return 1;
			}
			if (id1 < id2) {
				return -1;
			}
			return 0;
		});

		users.sort((a, b) => {
			if (a.userid > b.userid) {
				return 1;
			}

			if (a.userid < b.userid) {
				return -1;
			}

			return 0;
		});

		let newComlaints: Array<IComplaintOutput> = [];

		if (complaints.length) {
			complaints.forEach((complaint, index) => {
				if (complaint.userto !== users[index].userid) return;

				const newComplaint: IComplaintOutput = {
					timecode: complaint.timecode,
					userid: users[index].userid,
					userto: complaint.userto,
					name: users[index].name,
					birthday: users[index].birthday,
					monthofbirth: users[index].monthofbirth,
					yearofbirth: users[index].yearofbirth,
					photomain: users[index].photomain,
					photolink: users[index].photolink,
					status: complaint.status,
					messages: complaint.messages,
					complmessages: complaint.complmessages,
				};

				newComlaints.push(newComplaint);
			});

			newComlaints.sort(
				(a, b) =>
					b.messages[b.messages.length - 1].timecode -
					a.messages[a.messages.length - 1].timecode
			);
		} else {
			newComlaints = [];
		}
		return newComlaints;
	} catch (error) {
		console.log("getComplaints", error);
		return [];
	}
};