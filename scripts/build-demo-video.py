from pathlib import Path
import subprocess, imageio_ffmpeg
ff=imageio_ffmpeg.get_ffmpeg_exe()
texts=['Wondering how it works?','Twist to open.','Drop the cartridge in.','Click it closed.','Ready in three steps.']
filters=['[0:v]split=5'+''.join('[s%d]'%i for i in range(5))]
for i,text in enumerate(texts):
    filters.append(f"[s{i}]crop=iw/5-2:ih:{i}*iw/5+1:0,scale=540:960,setsar=1,zoompan=z='1+0.0006*on':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=90:s=540x960:fps=30,trim=duration=3,setpts=PTS-STARTPTS,drawbox=x=0:y=790:w=iw:h=170:color=black@0.6:t=fill,drawtext=fontfile=.work/arial.ttf:text='{text}':fontcolor=white:fontsize=30:x=(w-tw)/2:y=845[v{i}]")
filters.append(''.join('[v%d]'%i for i in range(5))+'concat=n=5:v=1:a=0[out]')
filters.append('[1:a]apad,atrim=duration=15,volume=0.85[voice]')
subprocess.run([ff,'-y','-i','public/demo/contact-sheet.png','-i','.work/voice.wav','-filter_complex',';'.join(filters),'-map','[out]','-map','[voice]','-t','15','-c:v','libx264','-preset','fast','-crf','22','-pix_fmt','yuv420p','-c:a','aac','-movflags','+faststart','public/demo/sample-ad.mp4'],check=True,stdout=subprocess.DEVNULL,stderr=open('.work/video-build.log','w'))
subprocess.run([ff,'-y','-i','public/demo/sample-ad.mp4','-frames:v','1','public/demo/poster.jpg'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
Path('public/demo/captions.vtt').write_text('WEBVTT\n\n'+'\n\n'.join(f'00:00:{i*3:02d}.000 --> 00:00:{(i+1)*3:02d}.000\n{t}' for i,t in enumerate(texts)),encoding='utf-8')
print('Created 15-second narrated sample video:',Path('public/demo/sample-ad.mp4').stat().st_size,'bytes')
