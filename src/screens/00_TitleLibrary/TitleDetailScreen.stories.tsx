import type { Meta, StoryObj } from '@storybook/react';
import { BrowserRouter, useParams } from 'react-router-dom';
import { TitleDetailScreen } from './TitleDetailScreen';

const TitleDetailScreenWithRouter = () => {
    return <TitleDetailScreen />;
};

const meta = {
    title: 'Screens/TitleDetail',
    component: TitleDetailScreenWithRouter,
    parameters: {
        layout: 'fullscreen',
    },
    decorators: [
        (Story) => (
            <BrowserRouter>
                <Story />
            </BrowserRouter>
        ),
    ],
} satisfies Meta<typeof TitleDetailScreenWithRouter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {},
};

export const NotFound: Story = {
    args: {},
};
