import React, { useState } from 'react';
import styles from '../styles';

const StyledButton = ({ variant = 'primary', children, style, ...props }) => {
    const [isHovered, setIsHovered] = useState(false);
    let variantStyle;
    switch (variant) {
        case 'secondary': variantStyle = styles.buttonSecondary; break;
        case 'destructive': variantStyle = styles.buttonDestructive; break;
        case 'ghost': variantStyle = styles.buttonGhost; break;
        default: variantStyle = styles.buttonPrimary; break;
    }
    const hoverStyles = {
        primary: { backgroundColor: '#B91C1C', transform: 'translateY(-2px)', boxShadow: '0 4px 8px rgba(220, 38, 38, 0.3)' },
        secondary: { backgroundColor: '#FCA5A5', color: 'white' },
        destructive: { backgroundColor: '#991B1B', transform: 'translateY(-2px)' },
        ghost: { backgroundColor: '#FEF2F2' }
    };
    const finalStyle = { ...styles.button, ...variantStyle, ...(isHovered && hoverStyles[variant]), ...style };
    if (props.disabled) {
        finalStyle.opacity = 0.5;
        finalStyle.cursor = 'not-allowed';
    }
    return (
        <button
            style={finalStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...props}
        >
            {children}
        </button>
    );
};

export default StyledButton;