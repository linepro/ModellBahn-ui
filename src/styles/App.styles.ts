import { createStyles } from '@material-ui/core';

import { colors } from './common-styles';

export default createStyles({
    filter_input: {
        display: 'flex',
        '& input::-webkit-input-placeholder': {
            fontStyle: 'italic',
            textTransform: 'capitalize'
        }
    },
    filter_underline: {
        '&:after': {
            backgroundColor: colors.secondary
        }
    },
    active: {
        color: colors.secondary
    },
    inactive: {
        color: colors.content_lighter
    }
});
