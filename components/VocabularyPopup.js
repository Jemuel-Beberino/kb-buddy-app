// components/VocabularyPopup.js
// Modal popup showing word definition, part of speech, and Bisaya translation

import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../styles/theme';

export default function VocabularyPopup({ visible, vocabulary, onClose }) {
    if (!vocabulary) return null;

    return ( <
        Modal visible = { visible }
        transparent = { true }
        animationType = "fade"
        onRequestClose = { onClose } >
        <
        TouchableWithoutFeedback onPress = { onClose } >
        <
        View style = { styles.overlay } >
        <
        TouchableWithoutFeedback >
        <
        View style = { styles.popup } >
        <
        ScrollView showsVerticalScrollIndicator = { false } > { /* Header row with icon and close */ } <
        View style = { styles.headerRow } >
        <
        View style = { styles.iconBadge } >
        <
        Ionicons name = "book"
        size = { 20 }
        color = { colors.primary }
        /> < /
        View > <
        Text style = { styles.headerLabel } > Vocabulary Help < /Text> <
        TouchableOpacity onPress = { onClose }
        style = { styles.closeIcon } >
        <
        Ionicons name = "close"
        size = { 20 }
        color = { colors.textSecondary }
        /> < /
        TouchableOpacity > <
        /View>

        { /* Word */ } <
        Text style = { styles.word } > { vocabulary.word } < /Text>

        { /* Part of speech */ } <
        Text style = { styles.partOfSpeech } > { vocabulary.partOfSpeech } < /Text>

        { /* Audio button */ } <
        TouchableOpacity style = { styles.audioButton }
        activeOpacity = { 0.85 } >
        <
        Ionicons name = "volume-high"
        size = { 18 }
        color = { colors.primary }
        /> <
        Text style = { styles.audioButtonText } > Listen to Pronunciation < /Text> < /
        TouchableOpacity >

        { /* English Definition */ } <
        Text style = { styles.label } > ENGLISH DEFINITION < /Text> <
        Text style = { styles.definition } > { vocabulary.englishDef } < /Text>

        { /* Bisaya Definition */ } <
        Text style = {
            [styles.label, { marginTop: spacing.lg }]
        } >
        BISAYA DEFINITION <
        /Text> <
        Text style = { styles.definition } > { vocabulary.bisayaDef } < /Text>

        { /* Example (if present) */ } {
            vocabulary.example && ( <
                View style = { styles.exampleBox } >
                <
                Text style = { styles.exampleLabel } > EXAMPLE < /Text> <
                Text style = { styles.exampleText } > { vocabulary.example } < /Text> < /
                View >
            )
        }

        { /* Close button */ } <
        TouchableOpacity style = { styles.closeButton }
        onPress = { onClose }
        activeOpacity = { 0.85 } >
        <
        Ionicons name = "arrow-back"
        size = { 18 }
        color = { colors.textLight }
        /> <
        Text style = { styles.closeButtonText } > Return to Story < /Text> < /
        TouchableOpacity > <
        /ScrollView> < /
        View > <
        /TouchableWithoutFeedback> < /
        View > <
        /TouchableWithoutFeedback> < /
        Modal >
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        justifyContent: 'flex-end',
    },
    popup: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
        padding: spacing.xl,
        maxHeight: '85%',
        ...shadows.cardLarge,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    iconBadge: {
        width: 36,
        height: 36,
        borderRadius: radius.md,
        backgroundColor: colors.primarySoft,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerLabel: {
        flex: 1,
        fontSize: typography.bodyLarge,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    closeIcon: {
        width: 36,
        height: 36,
        borderRadius: radius.pill,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surfaceMuted,
    },
    word: {
        fontSize: typography.displayMedium,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    partOfSpeech: {
        fontSize: typography.body,
        fontStyle: 'italic',
        color: colors.textSecondary,
        marginTop: 2,
        marginBottom: spacing.lg,
    },
    audioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primarySoft,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    audioButtonText: {
        color: colors.primary,
        fontSize: typography.body,
        fontWeight: '700',
    },
    label: {
        fontSize: typography.tiny,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1.5,
        marginBottom: spacing.sm,
    },
    definition: {
        fontSize: typography.bodyLarge,
        color: colors.textPrimary,
        lineHeight: 24,
    },
    exampleBox: {
        backgroundColor: colors.accentSoft,
        borderRadius: radius.md,
        padding: spacing.md,
        marginTop: spacing.lg,
    },
    exampleLabel: {
        fontSize: typography.tiny,
        fontWeight: '700',
        color: colors.textOnAccent,
        letterSpacing: 1.5,
        marginBottom: spacing.xs,
    },
    exampleText: {
        fontSize: typography.body,
        fontStyle: 'italic',
        color: colors.textOnAccent,
        lineHeight: 22,
    },
    closeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.primary,
        borderRadius: radius.pill,
        paddingVertical: spacing.lg,
        marginTop: spacing.xl,
    },
    closeButtonText: {
        color: colors.textLight,
        fontSize: typography.bodyLarge,
        fontWeight: '700',
    },
});