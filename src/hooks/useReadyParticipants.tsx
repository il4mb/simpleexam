import { useMemo } from "react";
import { useParticipants } from "./useParticipants";

export const useReadyParticipants = (uids: string[]) => {
    const { participants } = useParticipants();

    // ensure uniq IDs once per render
    const uniqUids = useMemo(() => Array.from(new Set(uids)), [uids]);

    return useMemo(() => {
        const readyList = participants.filter(p => uniqUids.includes(p.id));
        const unreadyList = participants.filter(p => !uniqUids.includes(p.id));
        return { readyList, unreadyList };
    }, [uniqUids, participants]);
};
