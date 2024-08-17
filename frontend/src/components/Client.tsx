import { useEffect } from "react";
import { Header } from "./misc";

export function Client() {

    useEffect(() => {
        console.log("Hello World!")
    }, []);

    return (
        <>
        {/* All your JSX here */} 
            <Header />

            <div>

                <form>
                    
                    <label></label>

                </form>


            </div>
        </>
    )
}