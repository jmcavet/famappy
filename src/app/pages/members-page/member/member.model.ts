// Represents an object of collection "members" in Firestore
export interface Member {
  type: string;
  name: string;
  sex: string;
  birthday: string;
}

// Used to add the document ID of the firestore object in order to eventually later on remove the Member by id
export interface MemberWithId extends Member {
  id: string;
}
