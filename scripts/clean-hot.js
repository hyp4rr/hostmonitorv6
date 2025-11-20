import { unlink } from 'fs/promises';
import { existsSync } from 'fs';

const hotFile = 'public/hot';

if (existsSync(hotFile)) {
    try {
        await unlink(hotFile);
        console.log('✅ Removed public/hot');
    } catch (error) {
        console.error('❌ Error removing public/hot:', error.message);
        process.exit(1);
    }
} else {
    console.log('ℹ️  public/hot does not exist');
}

