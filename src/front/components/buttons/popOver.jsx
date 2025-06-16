import React, { useEffect, useRef } from "react";

export const PopOver = ({ title, content, children })=> {

    // To prevent multiple popover initializations
    const ref = useRef(false);
    const popOverText = "You need to <strong>log in </strong> or <strong>register </strong> in order to like this recipe"

    useEffect(() => {
        const popover = new bootstrap.Popover(ref.current, {
        trigger: "hover",
        html: true,
        content:popOverText,
        placement: "top",
        });

        return () => popover.dispose();
    }, [title, content]);

    // Attach ref and data attribute to child button
    return (
        <>
        {React.cloneElement(children, {
            ref,
            "data-bs-toggle": "popover",
        })}
        </>
    );
}