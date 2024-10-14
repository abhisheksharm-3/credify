import librosa

# Remove Numba dependency
librosa.util.utils.__dict__['numba'] = None

# Replace Numba-dependent functions with their pure Python counterparts
librosa.util.utils.__dict__['pitch_tuning'] = librosa.util.utils.__dict__['__pitch_tuning']
librosa.util.utils.__dict__['tiny'] = librosa.util.utils.__dict__['__tiny']
librosa.util.utils.__dict__['normalize'] = librosa.util.utils.__dict__['__normalize']
librosa.util.utils.__dict__['localmax'] = librosa.util.utils.__dict__['__localmax']
librosa.util.utils.__dict__['peak_pick'] = librosa.util.utils.__dict__['__peak_pick']