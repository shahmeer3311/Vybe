import React from "react";

const GroupAvatar = ({ participants = [], currentUserId }) => {
    console.log("GroupAvatar participants:", participants);
  const normalized = participants.map((p) => {
    const id = p && typeof p === "object" && "_id" in p ? p._id : p;
    return {
      _id: String(id),
      profileImg: p?.profileImg,
      userName: p?.userName || p?.name || "User",
    };
  });

  const others = normalized.filter(
    (p) => String(p._id) !== String(currentUserId),
  );
  const firstThree = others.slice(0, 3);

  if (!firstThree.length) return null;

  return (
    <div className="relative w-10 h-10">
      {firstThree.map((p, index) => (
        <img
          key={p._id}
          src={
            p.profileImg ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
          }
          alt={p.userName}
          className="object-cover absolute w-8 h-8 rounded-full border-2 border-black"
          style={{
            left: `${index * 10}px`,
            top: `${index * 6}px`,
            zIndex: firstThree.length - index,
          }}
        />
      ))}
    </div>
  );
};

export default GroupAvatar;
