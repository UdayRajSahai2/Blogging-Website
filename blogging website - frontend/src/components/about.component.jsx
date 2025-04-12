import { Link } from "react-router-dom";
import { getFullDay } from "../common/date";

const AboutUser = ({ className, bio, social_links, joinedAt }) => {
    return (
        <div className={"md:w-[90%] md:mt-7 " + className}>
            <p className="text-xl leading-7">
                {bio?.length ? bio : "Nothing to read here"}
            </p>
            
            <div className="flex gap-5 my-7">
                {Object.keys(social_links || {}).map((key) => {
                    const link = social_links[key];
                    const iconClass = key !== 'website' 
                        ? `fi fi-brands-${key}`
                        : 'fi fi-rr-globe';
                    
                    return (
                        <div key={key} className="flex items-center">
                            {link ? (
                                <Link 
                                    to={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-2xl text-dark-grey hover:text-black"
                                    title={key.charAt(0).toUpperCase() + key.slice(1)}
                                >
                                    <i className={iconClass}></i>
                                </Link>
                            ) : (
                                <span 
                                    className="text-2xl text-light-grey"
                                    title={key.charAt(0).toUpperCase() + key.slice(1)}
                                >
                                    <i className={iconClass}></i>
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
            <p className="text-xl leading-7 text-dark-grey">Joined on {getFullDay(joinedAt)}</p>
        </div>
    );
};

export default AboutUser;